import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Animated
} from 'react-native';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import image from '@/assets/videos/homeVideo.gif';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import AuthModal from './screens/AuthModal';
import { ModalType } from '@/types/enums';

const { width, height } = Dimensions.get('window');

const Index = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['30%'], []);
  const [authType, setAuthType] = useState<ModalType | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const showModal = (type: ModalType) => {
    setAuthType(type);
    bottomSheetModalRef.current?.present();
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <ImageBackground
          source={image}
          style={styles.image}
          blurRadius={3}
        >
          <View style={styles.overlay}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>
                  Simplify Your{'\n'}
                  <Text style={styles.highlightedText}>Relocation</Text>{'\n'}
                  Experience!
                </Text>
                <Text style={styles.subheaderText}>
                  Start your journey to a new home today
                </Text>
              </View>

              <View style={styles.bottomSection}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={() => showModal(ModalType.Login)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginButtonText}>Login</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.signUpButton]}
                    onPress={() => showModal(ModalType.SignUp)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.description}>
                  By Signing Up, you agree to the{' '}
                  <Text
                    style={styles.link}
                    onPress={() => { /* open user notice link */ }}
                  >
                    User Notice
                  </Text> and{' '}
                  <Text
                    style={styles.link}
                    onPress={() => { /* open privacy policy link */ }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </ImageBackground>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        enableOverDrag={true}
        enablePanDownToClose={true}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        )}
      >
        <AuthModal authType={authType} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    // backgroundColor: '#fff',

  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: width * 0.05,
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? height * 0.08 : height * 0.05,
    alignItems: 'center',
  },
  headerText: {
    fontSize: width * 0.09,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    lineHeight: width * 0.11,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  highlightedText: {
    color: '#d8632c',
  },
  subheaderText: {
    fontSize: width * 0.045,
    color: '#e0e0e0',
    textAlign: 'center',
    marginTop: height * 0.02,
    opacity: 0.9,
  },
  bottomSection: {
    marginBottom: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.04,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.02,
  },
  button: {
    flex: 1,
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
    elevation: 6,
  },
  loginButton: {
    backgroundColor: '#d8632c',
  },
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#d8632c',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  signUpButtonText: {
    color: '#d8632c',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  description: {
    fontSize: width * 0.035,
    textAlign: 'center',
    color: '#e0e0e0',
    marginHorizontal: width * 0.1,
    marginTop: height * 0.01,
  },
  link: {
    color: 'black',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
});




// import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import React, { useMemo, useRef, useState } from 'react';
// import { StatusBar } from 'expo-status-bar';
// import image from '@/assets/videos/homeVideo.gif';
// import { defaultStyles } from '@/constants/Styles';
// import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
// import AuthModal from './screens/AuthModal';
// import { ModalType } from '@/types/enums'; // Ensure ModalType is imported
// import 'expo-dev-client';


// const Index = () => {
//   const bottomSheetModalRef = useRef<BottomSheetModal>(null);
//   const snapPoints = useMemo(() => ['33%'], []);
//   const [authType, setAuthType] = useState<ModalType | null>(null);

//   const showModal = (type: ModalType) => {
//     setAuthType(type);
//     bottomSheetModalRef.current?.present();
//   }

//   return (
//     <BottomSheetModalProvider>
//       <View style={styles.container}>
//         <StatusBar style="dark" />
//         <ImageBackground source={image} style={styles.image} />
//         <View style={{ marginTop: 40, padding: 20 }}>
//           <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
//         </View>

//         <View style={{ marginBottom: 30 }}>
//           <View style={styles.buttons}>
//             <TouchableOpacity
//               style={[defaultStyles.pillButton, { flex: 1, backgroundColor: "#d8632c" }]}
//               onPress={() => showModal(ModalType.Login)} // Show login modal
//             >
//               <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8632c' }]}
//               onPress={() => showModal(ModalType.SignUp)} // Show signup modal
//             >
//               <Text style={{ fontSize: 22, fontWeight: '500', color: '#d8632c' }}>Sign Up</Text>
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.description}>
//             By Signing Up, you agree to the{' '}
//             <Text style={styles.link} onPress={() => { /* open user notice link */ }}>
//               User Notice
//             </Text> and{' '}
//             <Text style={styles.link} onPress={() => { /* open privacy policy link */ }}>
//               Privacy Policy
//             </Text>
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
//   );
// }

// export default Index;

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
// });



// // import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// // import React, { useEffect, useMemo, useRef, useState } from 'react'
// // import { SafeAreaView } from 'react-native-safe-area-context'
// // import { StatusBar } from 'expo-status-bar'
// // import image from '@/assets/videos/homeVideo.gif';
// // // import backGroundVideo from '@/assets/videos/homeVideo.gif';
// // import { Link } from 'expo-router';
// // import { defaultStyles } from '@/constants/Styles';
// // import Colors from '@/constants/Colors';
// // import SplashScreenView from './screens/SplashScreenView';
// // import { ModalType } from '@/types/enums';
// // import * as WebBrowser from 'expo-web-browser';
// // import { useActionSheet } from '@expo/react-native-action-sheet';
// // import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
// // import AuthModal from './screens/AuthModal';

// // // const IMAGE = Image.resolveAssetSource(image).uri;

// // const Index = () => {
// //   // const [assets] = useAssets([require('@/assets/videos/homeVideo.gif')])
// //   const { showActionSheetWithOptions } = useActionSheet();
// //   const openLink = () => {
// //     WebBrowser.openBrowserAsync('https://jeff-lincoln-gitari.vercel.app/')
// //   }

// //   const bottomSheetModalRef = useRef<BottomSheetModal>(null);
// //   const snapPoints = useMemo(() => ['33%',], []);

// //   const [authType, setAuthType] = useState<ModalType | null>(null);

// //   const openActionSheet = async () => {
// //     const options = ['View support docs', 'Contact Us', 'Cancel'];
// //     const cancelButtonIndex = 2;

// //     showActionSheetWithOptions(
// //       {
// //         options,
// //         cancelButtonIndex,
// //         title: `Having trouble logging in or signing up?`
// //       },
// //       (selectedIndex: any) => {
// //         console.log(selectedIndex)
// //       }
// //     )
// //   }
// //   const showModal = (type: ModalType) => {
// //     setAuthType(type);
// //     bottomSheetModalRef.current?.present();
// //   }
// //   return (
// //     <BottomSheetModalProvider>
// //       <View style={styles.container}>
// //         <StatusBar style='dark' />
// //         <ImageBackground source={image} style={styles.image} />
// //         <View style={{ marginTop: 40, padding: 20 }}>
// //           <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
// //         </View>

// //         <View style={{ marginBottom: 30 }}>
// //           <TouchableOpacity style={{ marginBottom: 10, alignItems: 'center', padding: 10, backgroundColor: '#8958' }}
// //           onPress={showModal}>
// //             <Text>sign in options</Text>
// //           </TouchableOpacity>
// //           <View style={styles.buttons}>
// //             <Link href={'/screens/login'}
// //               style={[defaultStyles.pillButton, { flex: 1, backgroundColor: "#d8632c" }]}
// //               asChild>
// //               <TouchableOpacity>
// //                 <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
// //               </TouchableOpacity>
// //             </Link>
// //             <Link href={'/screens/signUp'}
// //               style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8632c' }]}
// //               asChild>
// //               <TouchableOpacity>
// //                 <Text style={{ fontSize: 22, fontWeight: '500', color: '#d8632c' }}>Sign Up</Text>
// //               </TouchableOpacity>
// //             </Link>
// //           </View>
// //           <Text style={styles.description}>By Signing Up, you agree to the{' '}
// //             <Text
// //               style={styles.link}
// //               onPress={openLink}>User Notice</Text> and {' '}
// //             <Text style={styles.link}
// //               onPress={openLink}>Privacy Policy</Text>
// //           </Text>
// //           <Text style={styles.link} onPress={openActionSheet}>
// //             Can't Login or SignUp?
// //           </Text>
// //         </View>
// //       </View>
// //       <BottomSheetModal
// //         ref={bottomSheetModalRef}
// //         index={0}
// //         snapPoints={snapPoints}
// //         handleComponent={null}
// //         enableOverDrag={true}
// //         enablePanDownToClose
// //       >
// //         <AuthModal authType={authType} />
// //       </BottomSheetModal>
// //     </BottomSheetModalProvider>
// //   )
// // }

// // export default Index

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     justifyContent: 'space-between'
// //   },
// //   image: {
// //     width: '100%',
// //     height: '100%',
// //     position: 'absolute'
// //   },
// //   headerText: {
// //     fontSize: 36,
// //     fontWeight: "900",
// //     color: '#d8632c'
// //   },
// //   buttons: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     gap: 20,
// //     marginBottom: 10
// //   },
// //   description: {
// //     fontSize: 12,
// //     textAlign: 'center',
// //     color: 'green',
// //     marginHorizontal: 60,
// //   },
// //   link: {
// //     color: '#d8632c',
// //     fontSize: 13,
// //     textAlign: 'center',
// //     textDecorationLine: 'underline'
// //   }
// // })



// // import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import React from 'react';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { StatusBar } from 'expo-status-bar';
// // import { Link } from 'expo-router';
// // import { defaultStyles } from '@/constants/Styles';
// // import Colors from '@/constants/Colors';
// // import image from '@/assets/videos/homeVideo.gif';

// // const IMAGE = Image.resolveAssetSource(image).uri;

// // const Index = () => {
// //   return (
// //     <View style={styles.container}>
// //       <StatusBar style='dark' />
// //       <Image source={{ uri: IMAGE }} style={styles.image} />
// //       <View style={styles.overlay}>
// //         <View style={{ marginTop: 40, padding: 20 }}>
// //           <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
// //         </View>
// //         <View style={styles.buttons}>
// //           <Link href='/screens/login' asChild>
// //             <TouchableOpacity style={[defaultStyles.pillButton, { flex: 1, backgroundColor: "#d8632c" }]}>
// //               <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
// //             </TouchableOpacity>
// //           </Link>
// //           <Link href='/screens/signUp' asChild>
// //             <TouchableOpacity style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#d8632c' }]}>
// //               <Text style={{ fontSize: 22, fontWeight: '500', color: '#d8632c' }}>Sign Up</Text>
// //             </TouchableOpacity>
// //           </Link>
// //         </View>
// //       </View>
// //     </View>
// //   );
// // };

// // export default Index;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   image: {
// //     position: 'absolute',
// //     width: '100%',
// //     height: '100%',
// //     resizeMode: 'cover',
// //   },
// //   overlay: {
// //     flex: 1,
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     width: '100%',
// //     padding: 20,
// //   },
// //   headerText: {
// //     fontSize: 36,
// //     fontWeight: "900",
// //     color: '#d8632c',
// //     textAlign: 'center',
// //   },
// //   buttons: {
// //     flexDirection: 'row',
// //     justifyContent: 'center',
// //     width: '100%',
// //     gap: 20,
// //     marginBottom: 60,
// //   },
// // });
