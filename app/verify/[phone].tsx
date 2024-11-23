import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View, Animated, Keyboard } from 'react-native';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { defaultStyles } from '@/constants/Styles';
import { StatusBar } from 'expo-status-bar';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import Colors from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';

const CELL_COUNT = 6;
const RESEND_TIMEOUT = 30;

const Page = () => {
    const { phone, signin } = useLocalSearchParams<{ phone: string, signin: string }>();
    const [code, setCode] = useState("");
    const { signIn } = useSignIn();
    const { signUp, setActive } = useSignUp();
    const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: code,
        setValue: setCode,
    });
    
    // New state variables for enhanced UX
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimeout, setResendTimeout] = useState(RESEND_TIMEOUT);
    const [showSuccess, setShowSuccess] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendTimeout > 0) {
            timer = setInterval(() => {
                setResendTimeout(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimeout]);

    useEffect(() => {
        if (code.length === CELL_COUNT) {
            Keyboard.dismiss();
            handleVerification();
        }
    }, [code]);

    const handleVerification = async () => {
        setIsLoading(true);
        if (signin === 'true') {
            await verifySignIn();
        } else {
            await verifyCode();
        }
        setIsLoading(false);
    };

    const verifyCode = async () => {
        if (!signUp) {
            console.error("SignUp object is not defined");
            return;
        }

        try {
            await signUp.attemptPhoneNumberVerification({ code });
            await setActive({ session: signUp.createdSessionId });
            handleSuccess();
        } catch (err) {
            handleError(err);
        }
    };

    const verifySignIn = async () => {
        if (!signIn) {
            console.error("SignIn object is not defined");
            return;
        }

        try {
            await signIn.attemptFirstFactor({ strategy: 'phone_code', code });
            await setActive!({ session: signIn.createdSessionId });
            handleSuccess();
        } catch (err) {
            handleError(err);
        }
    };

    const handleSuccess = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 2000);
    };

    const handleError = (err: any) => {
        console.error("error", JSON.stringify(err, null, 2));
        if (isClerkAPIResponseError(err)) {
            const errorMessage = err.errors[0]?.message || "An error occurred";
            Alert.alert("Verification Failed", errorMessage);
        } else {
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        }
        setCode('');
    };

    const handleResendCode = () => {
        // Implement resend logic here
        setResendTimeout(RESEND_TIMEOUT);
        Alert.alert("Code Resent", "A new verification code has been sent to your phone.");
    };

    const formatPhone = (phoneNumber: string) => {
        return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    };

    return (
        <>
            <StatusBar style='dark' />
            <Animated.View style={[defaultStyles.container, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <MaterialIcons name="verified-user" size={40} color={Colors.primary} />
                    <Text style={styles.headerText}>Verify Your Number</Text>
                </View>

                <Text style={styles.descriptionText}>
                    Enter the 6-digit code sent to{'\n'}
                    <Text style={styles.phoneText}>{formatPhone(phone)}</Text>
                </Text>

                <CodeField
                    ref={ref}
                    {...props}
                    value={code}
                    onChangeText={setCode}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
                    renderCell={({ index, symbol, isFocused }) => (
                        <Fragment key={index}>
                            <View
                                onLayout={getCellOnLayoutHandler(index)}
                                style={[
                                    styles.cellRoot,
                                    isFocused && styles.focusCell,
                                    symbol && styles.filledCell
                                ]}
                            >
                                <Text style={styles.cellText}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            </View>
                            {index === 2 ? <View style={styles.separator} /> : null}
                        </Fragment>
                    )}
                />

                <TouchableOpacity
                    style={[
                        styles.resendButton,
                        resendTimeout > 0 && styles.resendButtonDisabled
                    ]}
                    onPress={handleResendCode}
                    disabled={resendTimeout > 0}
                >
                    <Text style={[
                        styles.resendText,
                        resendTimeout > 0 && styles.resendTextDisabled
                    ]}>
                        {resendTimeout > 0 
                            ? `Resend code in ${resendTimeout}s`
                            : 'Resend code'}
                    </Text>
                </TouchableOpacity>

                <Link href={'/screens/login'} asChild>
                    <TouchableOpacity style={styles.loginLink}>
                        <Text style={styles.loginLinkText}>
                            Already have an account? Login
                        </Text>
                    </TouchableOpacity>
                </Link>

                {showSuccess && (
                    <View style={styles.successOverlay}>
                        <MaterialIcons name="check-circle" size={60} color="#fff" />
                        <Text style={styles.successText}>Verified Successfully!</Text>
                    </View>
                )}

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>Verifying...</Text>
                    </View>
                )}
            </Animated.View>
        </>
    );
};

export default Page;

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 16,
        color: '#333',
    },
    descriptionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    phoneText: {
        fontWeight: '600',
        color: '#333',
    },
    codeFieldRoot: {
        marginVertical: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        gap: 12,
    },
    cellRoot: {
        width: 45,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightGray,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cellText: {
        color: '#333',
        fontSize: 36,
        textAlign: 'center',
        fontWeight: '500',
    },
    focusCell: {
        borderColor: Colors.primary,
        backgroundColor: '#fff',
        transform: [{ scale: 1.05 }],
    },
    filledCell: {
        backgroundColor: '#fff',
    },
    separator: {
        height: 2,
        width: 20,
        backgroundColor: '#E5E5E5',
        alignSelf: 'center',
    },
    resendButton: {
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
    },
    resendButtonDisabled: {
        opacity: 0.6,
    },
    resendText: {
        color: Colors.primary,
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    resendTextDisabled: {
        color: '#999',
    },
    loginLink: {
        marginTop: 30,
        padding: 15,
    },
    loginLinkText: {
        color: Colors.primary,
        fontSize: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(46, 204, 113, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 10,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.primary,
        fontSize: 18,
        fontWeight: '500',
    },
});



// import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import React, { Fragment, useEffect, useState } from 'react';
// import { Link, useLocalSearchParams } from 'expo-router';
// import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
// import { defaultStyles } from '@/constants/Styles';
// import { StatusBar } from 'expo-status-bar';
// import {
//     CodeField,
//     Cursor,
//     useBlurOnFulfill,
//     useClearByFocusCell,
// } from 'react-native-confirmation-code-field';
// import Colors from '@/constants/Colors';

// const CELL_COUNT = 6;

// const Page = () => {
//     const { phone, signin } = useLocalSearchParams<{ phone: string, signin: string }>();
//     const [code, setCode] = useState("");
//     const { signIn } = useSignIn();
//     const { signUp, setActive } = useSignUp();
//     const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
//     const [props, getCellOnLayoutHandler] = useClearByFocusCell({
//         value: code,
//         setValue: setCode,
//     });

//     useEffect(() => {
//         if (code.length === CELL_COUNT) {
//             if (signin === 'true') {
//                 verifySignIn();
//             } else {
//                 verifyCode();
//             }
//         }
//     }, [code]);

//     const verifyCode = async () => {
//         if (!signUp) {
//             console.error("SignUp object is not defined");
//             return;
//         }

//         try {
//             console.log("Attempting phone number verification with code:", code);
//             await signUp.attemptPhoneNumberVerification({ code });
//             await setActive({ session: signUp.createdSessionId });
//         } catch (err) {
//             handleError(err);
//         }
//     };

//     const verifySignIn = async () => {
//         if (!signIn) {
//             console.error("SignIn object is not defined");
//             return;
//         }

//         try {
//             console.log("Attempting sign-in with code:", code);
//             await signIn.attemptFirstFactor({ strategy: 'phone_code', code });
//             await setActive!({ session: signIn.createdSessionId });
//         } catch (err) {
//             handleError(err);
//         }
//     };

//     const handleError = (err: any) => {
//         console.error("error", JSON.stringify(err, null, 2));
//         if (isClerkAPIResponseError(err)) {
//             const errorMessage = err.errors[0]?.message || "An error occurred";
//             Alert.alert("Error", errorMessage);
//         } else {
//             Alert.alert("Error", "An unexpected error occurred. Please try again.");
//         }
//     };

//     return (
//         <>
//             <StatusBar style='dark' />
//             <View style={defaultStyles.container}>
//                 <Text style={defaultStyles.header}>6-digit code</Text>
//                 <Text style={defaultStyles.descriptionText}>Code sent to {phone} unless you already have an account</Text>

//                 <CodeField
//                     ref={ref}
//                     {...props}
//                     value={code}
//                     onChangeText={setCode}
//                     cellCount={CELL_COUNT}
//                     rootStyle={styles.codeFieldRoot}
//                     keyboardType="number-pad"
//                     textContentType="oneTimeCode"
//                     autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
//                     testID="my-code-input"
//                     renderCell={({ index, symbol, isFocused }) => (
//                         <Fragment key={index}>
//                             <View
//                                 onLayout={getCellOnLayoutHandler(index)}
//                                 style={[styles.cellRoot, isFocused && styles.focusCell]}
//                             >
//                                 <Text style={styles.cellText}>
//                                     {symbol || (isFocused ? <Cursor /> : null)}
//                                 </Text>
//                             </View>
//                             {index === 2 ? <View key={`separator-${index}`} style={styles.separator} /> : null}
//                         </Fragment>
//                     )}
//                 />
//                 <Link href={'/screens/login'} asChild>
//                     <TouchableOpacity>
//                         <Text style={defaultStyles.textLink}>
//                             Already have an account? Login
//                         </Text>
//                     </TouchableOpacity>
//                 </Link>
//             </View>
//         </>
//     );
// };

// export default Page;

// const styles = StyleSheet.create({
//     codeFieldRoot: {
//         marginVertical: 20,
//         marginLeft: 'auto',
//         marginRight: 'auto',
//         gap: 12,
//     },
//     cellRoot: {
//         width: 45,
//         height: 60,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: Colors.lightGray,
//         borderRadius: 8,
//     },
//     cellText: {
//         color: '#000',
//         fontSize: 36,
//         textAlign: 'center'
//     },
//     focusCell: {
//         paddingBottom: 8,
//     },
//     separator: {
//         height: 2,
//     }
// });


// // import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import React, { Fragment, useEffect, useState } from 'react';
// // import { Link, useLocalSearchParams } from 'expo-router';
// // import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
// // import { defaultStyles } from '@/constants/Styles';
// // import { StatusBar } from 'expo-status-bar';
// // import {
// //     CodeField,
// //     Cursor,
// //     useBlurOnFulfill,
// //     useClearByFocusCell,
// // } from 'react-native-confirmation-code-field';
// // import Colors from '@/constants/Colors';

// // const CELL_COUNT = 6;

// // const Page = () => {
// //     const { phone, signin } = useLocalSearchParams<{ phone: string, signin: string }>();

// //     const [code, setCode] = useState("");
// //     const { signIn } = useSignIn();
// //     const { signUp, setActive } = useSignUp();

// //     const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
// //     const [props, getCellOnLayoutHandler] = useClearByFocusCell({
// //         value: code,
// //         setValue: setCode,
// //     });

// //     useEffect(() => {
// //         if (code.length === 6) {
// //             if (signin === 'true') {
// //                 verifySignIn();
// //             } else {
// //                 verifyCode();
// //             }
// //         }
// //     }, [code]);

// //     const verifyCode = async () => {
// //         if (!signUp) {
// //             console.error("SignUp object is not defined");
// //             return;
// //         }

// //         try {
// //             await signUp.attemptPhoneNumberVerification({ code });
// //             await setActive({ session: signUp.createdSessionId });
// //         } catch (err) {
// //             handleError(err);
// //         }
// //     };

// //     const verifySignIn = async () => {
// //         if (!signIn) {
// //             console.error("SignIn object is not defined");
// //             return;
// //         }

// //         try {
// //             await signIn.attemptFirstFactor({ strategy: 'phone_code', code });
// //             await setActive!({ session: signIn.createdSessionId });
// //         } catch (err) {
// //             handleError(err);
// //         }
// //     };

// //     const handleError = (err: any) => {
// //         console.error("error", JSON.stringify(err, null, 2));
// //         if (isClerkAPIResponseError(err)) {
// //             const errorMessage = err.errors[0]?.message || "An error occurred";
// //             Alert.alert("Error", errorMessage);
// //         } else {
// //             Alert.alert("Error", "An unexpected error occurred. Please try again.");
// //         }
// //     };

// //     return (
// //         <>
// //             <StatusBar style='dark' />
// //             <View style={defaultStyles.container}>
// //                 <Text style={defaultStyles.header}>6-digit code</Text>
// //                 <Text style={defaultStyles.descriptionText}>Code sent to {phone} unless you already have an account</Text>

// //                 <CodeField
// //                     ref={ref}
// //                     {...props}
// //                     value={code}
// //                     onChangeText={setCode}
// //                     cellCount={CELL_COUNT}
// //                     rootStyle={styles.codeFieldRoot}
// //                     keyboardType="number-pad"
// //                     textContentType="oneTimeCode"
// //                     autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
// //                     testID="my-code-input"
// //                     renderCell={({ index, symbol, isFocused }) => (
// //                         <Fragment key={index}>
// //                             <View
// //                                 onLayout={getCellOnLayoutHandler(index)}
// //                                 key={index}
// //                                 style={[styles.cellRoot, isFocused && styles.focusCell]}
// //                             >
// //                                 <Text style={styles.cellText}>
// //                                     {symbol || (isFocused ? <Cursor /> : null)}
// //                                 </Text>
// //                             </View>
// //                             {index === 2 ? <View key={`separator-${index}`} style={styles.separator} /> : null}
// //                         </Fragment>
// //                     )}
// //                 />
// //                 <Link href={'/screens/login'} asChild>
// //                     <TouchableOpacity>
// //                         <Text style={[defaultStyles.textLink]}>
// //                             Already have an account? Login
// //                         </Text>
// //                     </TouchableOpacity>
// //                 </Link>
// //             </View>
// //         </>
// //     );
// // };

// // export default Page;

// // const styles = StyleSheet.create({
// //     codeFieldRoot: {
// //         marginVertical: 20,
// //         marginLeft: 'auto',
// //         marginRight: 'auto',
// //         gap: 12,
// //     },
// //     cellRoot: {
// //         width: 45,
// //         height: 60,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         backgroundColor: Colors.lightGray,
// //         borderRadius: 8,
// //     },
// //     cellText: {
// //         color: '#000',
// //         fontSize: 36,
// //         textAlign: 'center'
// //     },
// //     focusCell: {
// //         paddingBottom: 8,
// //     },
// //     separator: {
// //         height: 2,
// //     }
// // });



// // import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// // import React, { Fragment, useEffect, useState } from 'react'
// // import { Link, useLocalSearchParams } from 'expo-router'
// // import { isClerkAPIResponseError, useSignIn, useSignUp } from '@clerk/clerk-expo';
// // import { defaultStyles } from '@/constants/Styles';
// // import { StatusBar } from 'expo-status-bar';

// // import {
// //     CodeField,
// //     Cursor,
// //     useBlurOnFulfill,
// //     useClearByFocusCell,
// // } from 'react-native-confirmation-code-field';
// // import Colors from '@/constants/Colors';

// // const CELL_COUNT = 6;

// // const Page = () => {
// //     const { phone, signin } = useLocalSearchParams<{ phone: string, signin: string }>();

// //     const [code, setCode] = useState("");
// //     const { signIn } = useSignIn();
// //     const { signUp, setActive } = useSignUp();

// //     const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });

// //     const [props, getCellOnLayoutHandler] = useClearByFocusCell({
// //         value: code,
// //         setValue: setCode,
// //     });

// //     useEffect(() => {
// //         if (code.length === 6) {
// //             // console.log("Code:-", code)
// //             if (signin === 'true') {
// //                 verifySignIn();
// //             } else {
// //                 verifyCode();
// //             }
// //         }
// //     }, [code]);

// //     const verifyCode = async () => {
// //         try {
// //             await signUp!.attemptPhoneNumberVerification({
// //                 code,
// //             });
// //             await setActive!({ session: signUp!.createdSessionId });

// //         } catch (err) {
// //             console.error("error", JSON.stringify(err, null, 2));
// //             if (isClerkAPIResponseError(err)) {
// //                 if (err.errors[0].code === "verification_code_not_found") {
// //                     Alert.alert("Error", err.errors[0].message);
// //                 }
// //             }
// //         }
// //     };

// //     const verifySignIn = async () => {
// //         try {
// //             await signIn!.attemptFirstFactor({
// //                 strategy: 'phone_code',
// //                 code,
// //             });
// //             await setActive!({ session: signIn!.createdSessionId });

// //         } catch (err) {
// //             console.error("error", JSON.stringify(err, null, 2));
// //             if (isClerkAPIResponseError(err)) {
// //                 if (err.errors[0].code === "verification_code_not_found") {
// //                     Alert.alert("Error", err.errors[0].message);
// //                 }
// //             }
// //         }
// //     };

// //     return (
// //         <>
// //             <StatusBar style='dark' />
// //             <View style={defaultStyles.container}>
// //                 <Text style={defaultStyles.header}>6-digit code</Text>
// //                 <Text style={defaultStyles.descriptionText}>Code sent to {phone} unless you already have an account</Text>

// //                 <CodeField
// //                     ref={ref}
// //                     {...props}
// //                     // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
// //                     value={code}
// //                     onChangeText={setCode}
// //                     cellCount={CELL_COUNT}
// //                     rootStyle={styles.codeFieldRoot}
// //                     keyboardType="number-pad"
// //                     textContentType="oneTimeCode"
// //                     autoComplete={Platform.select({ android: 'sms-otp', default: 'one-time-code' })}
// //                     testID="my-code-input"
// //                     renderCell={({ index, symbol, isFocused }) => (
// //                         <Fragment key={index}>
// //                             <View
// //                                 onLayout={getCellOnLayoutHandler(index)}
// //                                 key={index}
// //                                 style={[styles.cellRoot, isFocused && styles.focusCell]}
// //                             >
// //                                 <Text
// //                                     style={styles.cellText}
// //                                 >
// //                                     {symbol || (isFocused ? <Cursor /> : null)}
// //                                 </Text>
// //                             </View>
// //                             {index === 2 ? <View key={`separator-${index}`} style={styles.separator} /> : null}
// //                         </Fragment>
// //                     )}
// //                 />
// //                 <Link href={'/screens/login'} asChild>
// //                     <TouchableOpacity>
// //                         <Text style={[defaultStyles.textLink]}>
// //                             Already have an account? Login
// //                         </Text>

// //                     </TouchableOpacity>
// //                 </Link>
// //             </View>
// //         </>
// //     )
// // };

// // export default Page

// // const styles = StyleSheet.create({
// //     codeFieldRoot: {
// //         marginVertical: 20,
// //         marginLeft: 'auto',
// //         marginRight: 'auto',
// //         gap: 12,
// //     },
// //     cellRoot: {
// //         width: 45,
// //         height: 60,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         backgroundColor: Colors.lightGray,
// //         borderRadius: 8,
// //     },
// //     cellText: {
// //         color: '#000',
// //         fontSize: 36,
// //         textAlign: 'center'
// //     },
// //     focusCell: {
// //         paddingBottom: 8,
// //     },
// //     separator: {
// //         height: 2,
// //     }
// // })