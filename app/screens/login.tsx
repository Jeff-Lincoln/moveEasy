import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';

enum SignInType {
    Phone, Email, Google, Apple
}

const login = () => {
    const [countryCode, setCountryCode] = useState('+254');
    const [phoneNumber, setPhoneNumber] = useState('');
    const router = useRouter();
    const { signIn } = useSignIn();

    const onSignIn = async (type: SignInType) => {
        if (type === SignInType.Phone) {
            try {
                const fullPhoneNumber = `${countryCode}${phoneNumber}`;

                const { supportedFirstFactors } = await signIn!.create({
                    identifier: fullPhoneNumber,
                });
                const firstPhoneFactor: any = supportedFirstFactors.find((factor: any) => {
                    return factor.strategy === "phone_code";
                });

                const { phoneNumberId } = firstPhoneFactor;

                await signIn!.prepareFirstFactor({
                    strategy: "phone_code",
                    phoneNumberId,
                });

                router.push({ pathname: 'verify/[phone]', params: { phone: fullPhoneNumber, signin: "true" } });
            } catch (err) {
                console.log('error', JSON.stringify(err, null, 2));
                if (isClerkAPIResponseError(err)) {
                    if (err.errors[0].code === "form_identifier_not_found") {
                        Alert.alert("Error", err.errors[0].message);
                    }
                }
            }
        }
    };

    return (
        <>
            <StatusBar style='dark' />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'
                keyboardVerticalOffset={90}>
                <View style={defaultStyles.container}>
                    <Text style={defaultStyles.header}>Welcome back!😁</Text>
                    <Text style={defaultStyles.descriptionText}>
                        Enter the phone number associated with your account
                    </Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, styles.countryCodeInput]}
                            placeholder='Country Code'
                            placeholderTextColor={Colors.gray}
                            value={countryCode}
                        />
                        <TextInput
                            style={[styles.input, styles.phoneNumberInput]}
                            placeholder='Mobile Number'
                            placeholderTextColor={Colors.gray}
                            keyboardType='numeric'
                            value={phoneNumber}
                            onChangeText={setPhoneNumber} />
                    </View>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Phone)}
                        style={[
                            defaultStyles.pillButton,
                            phoneNumber !== '' ? styles.enabled : styles.disabled,
                            { marginBottom: 20 }
                        ]}>
                        <Text style={defaultStyles.buttonText}>Continue</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", alignItems: 'center', gap: 16 }}>
                        <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }}
                        />
                        <Text style={{ color: Colors.gray, fontSize: 16 }}>or</Text>
                        <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: Colors.gray }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Email)}
                        style={[defaultStyles.pillButton, {
                            flexDirection: 'row',
                            gap: 16,
                            marginTop: 20,
                            backgroundColor: "#fff",
                        }]}>
                        <Ionicons name="mail" size={24} color={"#000"} />
                        <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
                            Continue with email
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Google)}
                        style={[defaultStyles.pillButton, {
                            flexDirection: 'row',
                            gap: 16,
                            marginTop: 20,
                            backgroundColor: "#fff",
                        }]}>
                        <Ionicons name="logo-google" size={24} color={"#000"} />
                        <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onSignIn(SignInType.Apple)}
                        style={[defaultStyles.pillButton, {
                            flexDirection: 'row',
                            gap: 16,
                            marginTop: 20,
                            backgroundColor: "#fff",
                        }]}>
                        <Ionicons name="logo-apple" size={24} color={"#000"} />
                        <Text style={[defaultStyles.buttonText, { color: "#000" }]}>
                            Continue with Apple
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
    )
}

export default login

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
        flex: 1, // Take up the remaining space
    },
    countryCodeInput: {
        width: 100, // Fixed width for country code input
        marginRight: 10,
    },
    enabled: {
        backgroundColor: Colors.primary,
    },
    disabled: {
        backgroundColor: Colors.primaryMuted,
    }
})