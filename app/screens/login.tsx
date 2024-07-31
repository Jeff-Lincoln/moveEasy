import {
    Alert,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Platform,
} from 'react-native';
import React, { useState } from 'react';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';

enum SignInType {
    Phone,
    Email,
    Google,
    Apple,
}

const Login = () => {
    const [countryCode, setCountryCode] = useState('+254');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { signIn } = useSignIn();

    const validatePhoneNumber = (number: string): boolean => {
        const phoneRegex = /^(?:\+254|0)[7|1][0-9]{8}$/;
        return phoneRegex.test(number);
    };

    const onSignIn = async (type: SignInType) => {
        if (type === SignInType.Phone) {
            try {
                if (!validatePhoneNumber(phoneNumber)) {
                    Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
                    return;
                }

                setLoading(true);
                const fullPhoneNumber = `${countryCode}${phoneNumber}`;

                const { supportedFirstFactors } = await signIn!.create({
                    identifier: fullPhoneNumber,
                });

                const firstPhoneFactor = supportedFirstFactors.find((factor: any) => {
                    return factor.strategy === 'phone_code';
                });

                if (!firstPhoneFactor || !firstPhoneFactor.phoneNumberId) {
                    throw new Error('Phone number ID not found.');
                }

                const { phoneNumberId } = firstPhoneFactor;

                await signIn!.prepareFirstFactor({
                    strategy: 'phone_code',
                    phoneNumberId,
                });

                router.push({
                    pathname: 'verify/[phone]',
                    params: { phone: fullPhoneNumber, signin: 'true' },
                });
            } catch (err: any) {
                console.log('error', JSON.stringify(err, null, 2));
                if (isClerkAPIResponseError(err)) {
                    if (err.errors[0].code === 'form_identifier_not_found') {
                        Alert.alert("Account Not Found", "Couldn't find your account. Please sign up first.");
                    } else {
                        Alert.alert('Error', err.errors[0].message);
                    }
                } else {
                    Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Sign In Method Not Implemented', 'This sign-in method is not yet implemented.');
        }
    };

    return (
        <>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={90}
            >
                <View style={defaultStyles.container}>
                    <Text style={defaultStyles.header}>Welcome back! 😁</Text>
                    <Text style={defaultStyles.descriptionText}>
                        Enter the phone number associated with your account
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, styles.countryCodeInput]}
                            placeholder="Country Code"
                            placeholderTextColor={Colors.gray}
                            value={countryCode}
                            onChangeText={setCountryCode}
                        />
                        <TextInput
                            style={[styles.input, styles.phoneNumberInput]}
                            placeholder="Mobile Number"
                            placeholderTextColor={Colors.gray}
                            keyboardType="numeric"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} />
                    ) : (
                        <TouchableOpacity
                            onPress={() => onSignIn(SignInType.Phone)}
                            style={[
                                defaultStyles.pillButton,
                                phoneNumber !== '' ? styles.enabled : styles.disabled,
                                { marginBottom: 20 },
                            ]}
                        >
                            <Text style={defaultStyles.buttonText}>Continue</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>or</Text>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Email)}
                        style={[defaultStyles.pillButton, styles.oauthButton]}
                    >
                        <Ionicons name="mail" size={24} color="#000" />
                        <Text style={[defaultStyles.buttonText, styles.oauthButtonText]}>
                            Continue with email
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Google)}
                        style={[defaultStyles.pillButton, styles.oauthButton]}
                    >
                        <Ionicons name="logo-google" size={24} color="#000" />
                        <Text style={[defaultStyles.buttonText, styles.oauthButtonText]}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Apple)}
                        style={[defaultStyles.pillButton, styles.oauthButton]}
                    >
                        <Ionicons name="logo-apple" size={24} color="#000" />
                        <Text style={[defaultStyles.buttonText, styles.oauthButtonText]}>
                            Continue with Apple
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
    );
};

export default Login;

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 40,
        flexDirection: 'row',
    },
    input: {
        backgroundColor: Colors.lightGray,
        padding: 20,
        borderRadius: 16,
        fontSize: 18,
        marginRight: 10,
    },
    phoneNumberInput: {
        flex: 1,
    },
    countryCodeInput: {
        width: 100,
        marginRight: 10,
    },
    enabled: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.primaryMuted,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: Colors.gray,
    },
    orText: {
        color: Colors.gray,
        fontSize: 16,
    },
    oauthButton: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 20,
        backgroundColor: '#fff',
    },
    oauthButtonText: {
        color: '#000',
    },
});


// import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
// import React, { useState } from 'react';
// import { defaultStyles } from '@/constants/Styles';
// import Colors from '@/constants/Colors';
// import { Link, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';

// enum SignInType {
//     Phone, Email, Google, Apple
// }

// const Login = () => {
//     const [countryCode, setCountryCode] = useState('+254');
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();
//     const { signIn } = useSignIn();

//     const validatePhoneNumber = (number) => {
//         const phoneRegex = /^[0-9]{9,12}$/; // Adjust regex as needed
//         return phoneRegex.test(number);
//     };

//     const onSignIn = async (type: SignInType) => {
//         if (type === SignInType.Phone) {
//             try {
//                 if (!validatePhoneNumber(phoneNumber)) {
//                     Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
//                     return;
//                 }

//                 setLoading(true);
//                 const fullPhoneNumber = `${countryCode}${phoneNumber}`;

//                 const { supportedFirstFactors } = await signIn!.create({
//                     identifier: fullPhoneNumber,
//                 });

//                 // Log the supportedFirstFactors to inspect the object structure
//                 console.log('supportedFirstFactors:', supportedFirstFactors);

//                 const firstPhoneFactor = supportedFirstFactors.find((factor) => {
//                     return factor.strategy === "phone_code";
//                 });

//                 if (!firstPhoneFactor || !firstPhoneFactor.phoneNumberId) {
//                     throw new Error('Phone number ID not found.');
//                 }

//                 const { phoneNumberId } = firstPhoneFactor;

//                 await signIn!.prepareFirstFactor({
//                     strategy: "phone_code",
//                     phoneNumberId,
//                 });

//                 router.push({ pathname: 'verify/[phone]', params: { phone: fullPhoneNumber, signin: "true" } });
//             } catch (err) {
//                 console.log('error', JSON.stringify(err, null, 2));
//                 if (isClerkAPIResponseError(err)) {
//                     if (err.errors[0].code === "form_identifier_not_found") {
//                         Alert.alert("Account Not Found", "Couldn't find your account. Please sign up first.");
//                     } else {
//                         Alert.alert("Error", err.errors[0].message);
//                     }
//                 } else {
//                     Alert.alert("Error", err.message || "Something went wrong. Please try again.");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             Alert.alert('Sign In Method Not Implemented', 'This sign-in method is not yet implemented.');
//         }
//     };

//     return (
//         <>
//             <StatusBar style='dark' />
//             <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={90}>
//                 <View style={defaultStyles.container}>
//                     <Text style={defaultStyles.header}>Welcome back!😁</Text>
//                     <Text style={defaultStyles.descriptionText}>
//                         Enter the phone number associated with your account
//                     </Text>

//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             style={[styles.input, styles.countryCodeInput]}
//                             placeholder='Country Code'
//                             placeholderTextColor={Colors.gray}
//                             value={countryCode}
//                             editable={false} // Making it non-editable for now
//                         />
//                         <TextInput
//                             style={[styles.input, styles.phoneNumberInput]}
//                             placeholder='Mobile Number'
//                             placeholderTextColor={Colors.gray}
//                             keyboardType='numeric'
//                             value={phoneNumber}
//                             onChangeText={setPhoneNumber}
//                             accessibilityLabel="Mobile Number"
//                         />
//                     </View>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Phone)}
//                         style={[
//                             defaultStyles.pillButton,
//                             phoneNumber !== '' ? styles.enabled : styles.disabled,
//                             { marginBottom: 20 }
//                         ]}
//                         disabled={phoneNumber === ''}
//                         accessibilityLabel="Continue"
//                     >
//                         {loading ? (
//                             <ActivityIndicator color={Colors.white} />
//                         ) : (
//                             <Text style={defaultStyles.buttonText}>Continue</Text>
//                         )}
//                     </TouchableOpacity>

//                     <View style={{ flexDirection: "row", alignItems: 'center', gap: 16 }}>
//                         <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }} />
//                         <Text style={{ color: Colors.gray, fontSize: 16 }}>or</Text>
//                         <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }} />
//                     </View>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Email)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}
//                     >
//                         <Ionicons name="mail" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with email
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Google)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}
//                     >
//                         <Ionicons name="logo-google" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with Google
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Apple)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}
//                     >
//                         <Ionicons name="logo-apple" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with Apple
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </>
//     );
// };

// export default Login;

// const styles = StyleSheet.create({
//     inputContainer: {
//         marginVertical: 40,
//         flexDirection: 'row',
//     },
//     input: {
//         backgroundColor: Colors.lightGray,
//         padding: 20,
//         borderRadius: 16,
//         fontSize: 18,
//         marginRight: 10,
//     },
//     phoneNumberInput: {
//         flex: 1,
//     },
//     countryCodeInput: {
//         width: 100,
//     },
//     enabled: {
//         backgroundColor: Colors.primary,
//     },
//     disabled: {
//         backgroundColor: Colors.primaryMuted,
//     }
// });


// import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
// import React, { useState } from 'react';
// import { defaultStyles } from '@/constants/Styles';
// import Colors from '@/constants/Colors';
// import { Link, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';

// enum SignInType {
//     Phone, Email, Google, Apple
// }

// const Login = () => {
//     const [countryCode, setCountryCode] = useState('+254');
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();
//     const { signIn } = useSignIn();

//     const validatePhoneNumber = (number) => {
//         const phoneRegex = /^[0-9]{9,12}$/; // Adjust regex as needed
//         return phoneRegex.test(number);
//     };

//     const onSignIn = async (type: SignInType) => {
//         if (type === SignInType.Phone) {
//             try {
//                 if (!validatePhoneNumber(phoneNumber)) {
//                     Alert.alert('Invalid Phone Number', 'Please enter a valid phone number.');
//                     return;
//                 }

//                 setLoading(true);
//                 const fullPhoneNumber = `${countryCode}${phoneNumber}`;

//                 const { supportedFirstFactors } = await signIn!.create({
//                     identifier: fullPhoneNumber,
//                 });
//                 const firstPhoneFactor = supportedFirstFactors.find((factor) => {
//                     return factor.strategy === "phone_code";
//                 });

//                 const { phoneNumberId } = firstPhoneFactor;

//                 await signIn!.prepareFirstFactor({
//                     strategy: "phone_code",
//                     phoneNumberId,
//                 });

//                 router.push({ pathname: 'verify/[phone]', params: { phone: fullPhoneNumber, signin: "true" } });
//             } catch (err) {
//                 console.log('error', JSON.stringify(err, null, 2));
//                 if (isClerkAPIResponseError(err)) {
//                     if (err.errors[0].code === "form_identifier_not_found") {
//                         Alert.alert("Error", err.errors[0].message);
//                     }
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             Alert.alert('Sign In Method Not Implemented', 'This sign-in method is not yet implemented.');
//         }
//     };

//     return (
//         <>
//             <StatusBar style='dark' />
//             <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding' keyboardVerticalOffset={90}>
//                 <View style={defaultStyles.container}>
//                     <Text style={defaultStyles.header}>Welcome back!😁</Text>
//                     <Text style={defaultStyles.descriptionText}>
//                         Enter the phone number associated with your account
//                     </Text>

//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             style={[styles.input, styles.countryCodeInput]}
//                             placeholder='Country Code'
//                             placeholderTextColor={Colors.gray}
//                             value={countryCode}
//                             editable={false} // Making it non-editable for now
//                         />
//                         <TextInput
//                             style={[styles.input, styles.phoneNumberInput]}
//                             placeholder='Mobile Number'
//                             placeholderTextColor={Colors.gray}
//                             keyboardType='numeric'
//                             value={phoneNumber}
//                             onChangeText={setPhoneNumber}
//                             accessibilityLabel="Mobile Number"
//                         />
//                     </View>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Phone)}
//                         style={[
//                             defaultStyles.pillButton,
//                             phoneNumber !== '' ? styles.enabled : styles.disabled,
//                             { marginBottom: 20 }
//                         ]}
//                         disabled={phoneNumber === ''}
//                         accessibilityLabel="Continue"
//                     >
//                         {loading ? (
//                             <ActivityIndicator color={Colors.white} />
//                         ) : (
//                             <Text style={defaultStyles.buttonText}>Continue</Text>
//                         )}
//                     </TouchableOpacity>

//                     <View style={{ flexDirection: "row", alignItems: 'center', gap: 16 }}>
//                         <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }} />
//                         <Text style={{ color: Colors.gray, fontSize: 16 }}>or</Text>
//                         <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }} />
//                     </View>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Email)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}
//                     >
//                         <Ionicons name="mail" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with email
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Google)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}
//                     >
//                         <Ionicons name="logo-google" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with Google
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Apple)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}
//                     >
//                         <Ionicons name="logo-apple" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with Apple
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </>
//     );
// };

// export default Login;

// const styles = StyleSheet.create({
//     inputContainer: {
//         marginVertical: 40,
//         flexDirection: 'row',
//     },
//     input: {
//         backgroundColor: Colors.lightGray,
//         padding: 20,
//         borderRadius: 16,
//         fontSize: 18,
//         marginRight: 10,
//     },
//     phoneNumberInput: {
//         flex: 1,
//     },
//     countryCodeInput: {
//         width: 100,
//     },
//     enabled: {
//         backgroundColor: Colors.primary,
//     },
//     disabled: {
//         backgroundColor: Colors.primaryMuted,
//     }
// });


// import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
// import React, { useState } from 'react'
// import { defaultStyles } from '@/constants/Styles';
// import Colors from '@/constants/Colors';
// import { Link, useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';

// enum SignInType {
//     Phone, Email, Google, Apple
// }

// const login = () => {
//     const [countryCode, setCountryCode] = useState('+254');
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const router = useRouter();
//     const { signIn } = useSignIn();

//     const onSignIn = async (type: SignInType) => {
//         if (type === SignInType.Phone) {
//             try {
//                 const fullPhoneNumber = `${countryCode}${phoneNumber}`;

//                 const { supportedFirstFactors } = await signIn!.create({
//                     identifier: fullPhoneNumber,
//                 });
//                 const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
//                     return factor.strategy === "phone_code";
//                 });

//                 const { phoneNumberId } = firstPhoneFactor;

//                 await signIn!.prepareFirstFactor({
//                     strategy: "phone_code",
//                     phoneNumberId,
//                 });

//                 router.push({ pathname: 'verify/[phone]', params: { phone: fullPhoneNumber, signin: "true" } });
//             } catch (err) {
//                 console.log('error', JSON.stringify(err, null, 2));
//                 if (isClerkAPIResponseError(err)) {
//                     if (err.errors[0].code === "form_identifier_not_found") {
//                         Alert.alert("Error", err.errors[0].message);
//                     }
//                 }
//             }
//         }
//     };

//     return (
//         <>
//             <StatusBar style='dark' />
//             <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'
//                 keyboardVerticalOffset={90}>
//                 <View style={defaultStyles.container}>
//                     <Text style={defaultStyles.header}>Welcome back!😁</Text>
//                     <Text style={defaultStyles.descriptionText}>
//                         Enter the phone number associated with your account
//                     </Text>

//                     <View style={styles.inputContainer}>
//                         <TextInput
//                             style={[styles.input, styles.countryCodeInput]}
//                             placeholder='Country Code'
//                             placeholderTextColor={Colors.gray}
//                             value={countryCode}
//                         />
//                         <TextInput
//                             style={[styles.input, styles.phoneNumberInput]}
//                             placeholder='Mobile Number'
//                             placeholderTextColor={Colors.gray}
//                             keyboardType='numeric'
//                             value={phoneNumber}
//                             onChangeText={setPhoneNumber} />
//                     </View>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Phone)}
//                         style={[
//                             defaultStyles.pillButton,
//                             phoneNumber !== '' ? styles.enabled : styles.disabled,
//                             { marginBottom: 20 }
//                         ]}>
//                         <Text style={defaultStyles.buttonText}>Continue</Text>
//                     </TouchableOpacity>

//                     <View style={{ flexDirection: "row", alignItems: 'center', gap: 16 }}>
//                         <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }}
//                         />
//                         <Text style={{ color: Colors.gray, fontSize: 16 }}>or</Text>
//                         <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }}
//                         />
//                     </View>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Email)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}>
//                         <Ionicons name="mail" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with email
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Google)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}>
//                         <Ionicons name="logo-google" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with Google
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         onPress={() => onSignIn(SignInType.Apple)}
//                         style={[defaultStyles.pillButton, {
//                             flexDirection: 'row',
//                             gap: 16,
//                             marginTop: 20,
//                             backgroundColor: "#fff",
//                         }]}>
//                         <Ionicons name="logo-apple" size={24} color={"#000"} />
//                         <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
//                             Continue with Apple
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </>
//     )
// }

// export default login

// const styles = StyleSheet.create({
//     inputContainer: {
//         marginVertical: 40,
//         flexDirection: 'row',
//     },
//     input: {
//         backgroundColor: Colors.lightGray,
//         padding: 20,
//         borderRadius: 16,
//         fontSize: 18,
//         marginRight: 10,
//     },
//     phoneNumberInput: {
//         flex: 1, // Take up the remaining space
//     },
//     countryCodeInput: {
//         width: 100, // Fixed width for country code input
//         marginRight: 10,
//     },
//     enabled: {
//         backgroundColor: Colors.primary,
//     },
//     disabled: {
//         backgroundColor: Colors.primaryMuted,
//     }
// })