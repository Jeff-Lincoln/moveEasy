import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useMemo, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import image from '@/assets/videos/homeVideo.gif';
import { defaultStyles } from '@/constants/Styles';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AuthModal from './screens/AuthModal';
import { ModalType } from '@/types/enums'; // Ensure ModalType is imported
import 'expo-dev-client';


const Index = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['33%'], []);
  const [authType, setAuthType] = useState<ModalType | null>(null);

  const showModal = (type: ModalType) => {
    setAuthType(type);
    bottomSheetModalRef.current?.present();
  }

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <ImageBackground source={image} style={styles.image} />
        <View style={{ marginTop: 40, padding: 20 }}>
          <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
        </View>

        <View style={{ marginBottom: 30 }}>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[defaultStyles.pillButton, { flex: 1, backgroundColor: "#d8632c" }]}
              onPress={() => showModal(ModalType.Login)} // Show login modal
            >
              <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8632c' }]}
              onPress={() => showModal(ModalType.SignUp)} // Show signup modal
            >
              <Text style={{ fontSize: 22, fontWeight: '500', color: '#d8632c' }}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>
            By Signing Up, you agree to the{' '}
            <Text style={styles.link} onPress={() => { /* open user notice link */ }}>
              User Notice
            </Text> and{' '}
            <Text style={styles.link} onPress={() => { /* open privacy policy link */ }}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        enableOverDrag={true}
        enablePanDownToClose
      >
        <AuthModal authType={authType} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  headerText: {
    fontSize: 36,
    fontWeight: "900",
    color: '#d8632c'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 10
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: 'green',
    marginHorizontal: 60,
  },
  link: {
    color: '#d8632c',
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline'
  }
});



// import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import React, { useEffect, useMemo, useRef, useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import { StatusBar } from 'expo-status-bar'
// import image from '@/assets/videos/homeVideo.gif';
// // import backGroundVideo from '@/assets/videos/homeVideo.gif';
// import { Link } from 'expo-router';
// import { defaultStyles } from '@/constants/Styles';
// import Colors from '@/constants/Colors';
// import SplashScreenView from './screens/SplashScreenView';
// import { ModalType } from '@/types/enums';
// import * as WebBrowser from 'expo-web-browser';
// import { useActionSheet } from '@expo/react-native-action-sheet';
// import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
// import AuthModal from './screens/AuthModal';

// // const IMAGE = Image.resolveAssetSource(image).uri;

// const Index = () => {
//   // const [assets] = useAssets([require('@/assets/videos/homeVideo.gif')])
//   const { showActionSheetWithOptions } = useActionSheet();
//   const openLink = () => {
//     WebBrowser.openBrowserAsync('https://jeff-lincoln-gitari.vercel.app/')
//   }

//   const bottomSheetModalRef = useRef<BottomSheetModal>(null);
//   const snapPoints = useMemo(() => ['33%',], []);

//   const [authType, setAuthType] = useState<ModalType | null>(null);

//   const openActionSheet = async () => {
//     const options = ['View support docs', 'Contact Us', 'Cancel'];
//     const cancelButtonIndex = 2;

//     showActionSheetWithOptions(
//       {
//         options,
//         cancelButtonIndex,
//         title: `Having trouble logging in or signing up?`
//       },
//       (selectedIndex: any) => {
//         console.log(selectedIndex)
//       }
//     )
//   }
//   const showModal = (type: ModalType) => {
//     setAuthType(type);
//     bottomSheetModalRef.current?.present();
//   }
//   return (
//     <BottomSheetModalProvider>
//       <View style={styles.container}>
//         <StatusBar style='dark' />
//         <ImageBackground source={image} style={styles.image} />
//         <View style={{ marginTop: 40, padding: 20 }}>
//           <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
//         </View>

//         <View style={{ marginBottom: 30 }}>
//           <TouchableOpacity style={{ marginBottom: 10, alignItems: 'center', padding: 10, backgroundColor: '#8958' }}
//           onPress={showModal}>
//             <Text>sign in options</Text>
//           </TouchableOpacity>
//           <View style={styles.buttons}>
//             <Link href={'/screens/login'}
//               style={[defaultStyles.pillButton, { flex: 1, backgroundColor: "#d8632c" }]}
//               asChild>
//               <TouchableOpacity>
//                 <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
//               </TouchableOpacity>
//             </Link>
//             <Link href={'/screens/signUp'}
//               style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8632c' }]}
//               asChild>
//               <TouchableOpacity>
//                 <Text style={{ fontSize: 22, fontWeight: '500', color: '#d8632c' }}>Sign Up</Text>
//               </TouchableOpacity>
//             </Link>
//           </View>
//           <Text style={styles.description}>By Signing Up, you agree to the{' '}
//             <Text
//               style={styles.link}
//               onPress={openLink}>User Notice</Text> and {' '}
//             <Text style={styles.link}
//               onPress={openLink}>Privacy Policy</Text>
//           </Text>
//           <Text style={styles.link} onPress={openActionSheet}>
//             Can't Login or SignUp?
//           </Text>
//         </View>
//       </View>
//       <BottomSheetModal
//         ref={bottomSheetModalRef}
//         index={0}
//         snapPoints={snapPoints}
//         handleComponent={null}
//         enableOverDrag={true}
//         enablePanDownToClose
//       >
//         <AuthModal authType={authType} />
//       </BottomSheetModal>
//     </BottomSheetModalProvider>
//   )
// }

// export default Index

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'space-between'
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     position: 'absolute'
//   },
//   headerText: {
//     fontSize: 36,
//     fontWeight: "900",
//     color: '#d8632c'
//   },
//   buttons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 20,
//     marginBottom: 10
//   },
//   description: {
//     fontSize: 12,
//     textAlign: 'center',
//     color: 'green',
//     marginHorizontal: 60,
//   },
//   link: {
//     color: '#d8632c',
//     fontSize: 13,
//     textAlign: 'center',
//     textDecorationLine: 'underline'
//   }
// })



// import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import React from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { Link } from 'expo-router';
// import { defaultStyles } from '@/constants/Styles';
// import Colors from '@/constants/Colors';
// import image from '@/assets/videos/homeVideo.gif';

// const IMAGE = Image.resolveAssetSource(image).uri;

// const Index = () => {
//   return (
//     <View style={styles.container}>
//       <StatusBar style='dark' />
//       <Image source={{ uri: IMAGE }} style={styles.image} />
//       <View style={styles.overlay}>
//         <View style={{ marginTop: 40, padding: 20 }}>
//           <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
//         </View>
//         <View style={styles.buttons}>
//           <Link href='/screens/login' asChild>
//             <TouchableOpacity style={[defaultStyles.pillButton, { flex: 1, backgroundColor: "#d8632c" }]}>
//               <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
//             </TouchableOpacity>
//           </Link>
//           <Link href='/screens/signUp' asChild>
//             <TouchableOpacity style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8632c' }]}>
//               <Text style={{ fontSize: 22, fontWeight: '500', color: '#d8632c' }}>Sign Up</Text>
//             </TouchableOpacity>
//           </Link>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default Index;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   image: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     padding: 20,
//   },
//   headerText: {
//     fontSize: 36,
//     fontWeight: "900",
//     color: '#d8632c',
//     textAlign: 'center',
//   },
//   buttons: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     width: '100%',
//     gap: 20,
//     marginBottom: 60,
//   },
// });
