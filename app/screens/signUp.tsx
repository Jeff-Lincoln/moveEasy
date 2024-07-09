import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import { Link, useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';

const signUp = () => {
    const [countryCode, setCountryCode] = useState('+254');
    const [phoneNumber, setPhoneNumber] = useState('');
    const router = useRouter();
    const { signUp } = useSignUp();

    const onSignUp = async () => {
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;

        try {
            await signUp!.create({
                phoneNumber: fullPhoneNumber,
            });
            signUp!.preparePhoneNumberVerification();

            router.push({ pathname: '/verify/[phone]', params: { phoneNumber: fullPhoneNumber } })
        } catch (error) {
            console.log("Error Signing up! ", error);
        }
    };

    return (
        <>
            <StatusBar style='dark' />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'
                keyboardVerticalOffset={90}>
                <View style={defaultStyles.container}>
                    <Text style={defaultStyles.header}>Let's Get Started!😁</Text>
                    <Text style={defaultStyles.descriptionText}>
                        Enter your phone number. We will send you a confirmation code there
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

                    <Link href={'/screens/login'} replace asChild>
                        <TouchableOpacity>
                            <Text style={defaultStyles.textLink}>
                                Already have an account? Log in
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <View style={{ flex: 1 }} />
                    <TouchableOpacity
                        onPress={onSignUp}
                        style={[
                            defaultStyles.pillButton,
                            phoneNumber !== '' ? styles.enabled : styles.disabled,
                            { marginBottom: 20 }
                        ]}>
                        <Text style={defaultStyles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
    )
}

export default signUp

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