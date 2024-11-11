import { AuthStrategy, ModalType } from '@/types/enums';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

interface AuthModalProps {
    authType: ModalType | null;
}

const LOGIN_OPTIONS = [
    {
        text: 'Continue with Google',
        icon: require('@/assets/images/login/google.png'),
        strategy: AuthStrategy.Google,
    },
    {
        text: 'Continue with Microsoft',
        icon: require('@/assets/images/login/microsoft.png'),
        strategy: AuthStrategy.Microsoft,
    },
    {
        text: 'Continue with Apple',
        icon: require('@/assets/images/login/apple.png'),
        strategy: AuthStrategy.Apple,
    },
    {
        text: 'Continue with Slack',
        icon: require('@/assets/images/login/slack.png'),
        strategy: AuthStrategy.Slack,
    },
];

const AuthModal = ({ authType }: AuthModalProps) => {
    useWarmUpBrowser();
    const { top } = useSafeAreaInsets();
    const router = useRouter();
    const { startOAuthFlow: googleAuth } = useOAuth({ strategy: AuthStrategy.Google });
    const { startOAuthFlow: microsoftAuth } = useOAuth({ strategy: AuthStrategy.Microsoft });
    const { startOAuthFlow: slackAuth } = useOAuth({ strategy: AuthStrategy.Slack });
    const { startOAuthFlow: appleAuth } = useOAuth({ strategy: AuthStrategy.Apple });
    const { signUp, setActive } = useSignUp();
    const { signIn } = useSignIn();

    const onSelectedAuth = async (strategy: AuthStrategy) => {
        if (!signIn || !signUp) return;

        const selectedAuth = {
            [AuthStrategy.Google]: googleAuth,
            [AuthStrategy.Microsoft]: microsoftAuth,
            [AuthStrategy.Slack]: slackAuth,
            [AuthStrategy.Apple]: appleAuth,
        }[strategy];

        const userExistsButNeedsToSignIn =
            signUp.verifications.externalAccount.status === 'transferable' &&
            signUp.verifications.externalAccount.error?.code === 'external_account_exists';

        if (userExistsButNeedsToSignIn) {
            const res = await signIn.create({ transfer: true });

            if (res.status === 'complete') {
                setActive({ session: res.createdSessionId });
            }
        }

        const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

        if (userNeedsToBeCreated) {
            const res = await signUp.create({ transfer: true });

            if (res.status === 'complete') {
                setActive({ session: res.createdSessionId });
            }
        } else {
            try {
                const { createdSessionId } = await selectedAuth();

                if (createdSessionId) {
                    setActive!({ session: createdSessionId });
                    router.replace('/(authenticated)/(tabs)/Home');
                    console.log('OAuth success standard');
                }
            } catch (err) {
                console.error('OAuth error', err);
            }
        }
    };

    const onPressPhoneAuth = () => {
        router.push(authType === ModalType.Login ? '/screens/login' : '/screens/signUp');
    };

    return (
        <BottomSheetView style={[styles.modalContainer]}>
            {authType === ModalType.Login ? (
                <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={onPressPhoneAuth}
                >
                    <Ionicons name="mail-outline" size={20} />
                    <Text style={styles.btnText}>
                        Log in with Phone Number
                    </Text>
                </TouchableOpacity>
            ) : authType === ModalType.SignUp ? (
                <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={onPressPhoneAuth}
                >
                    <Ionicons name="mail-outline" size={20} />
                    <Text style={styles.btnText}>
                        Sign up with Phone Number
                    </Text>
                </TouchableOpacity>
            ) : null}
            {LOGIN_OPTIONS.map((option, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.modalBtn}
                    onPress={() => onSelectedAuth(option.strategy!)}
                >
                    <Image source={option.icon} style={styles.btnIcon} />
                    <Text style={styles.btnText}>{option.text}</Text>
                </TouchableOpacity>
            ))}
        </BottomSheetView>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'flex-start',
        padding: 20,
        gap: 20,
        backgroundColor: '#fff'
    },
    modalBtn: {
        flexDirection: 'row',
        gap: 14,
        alignItems: 'center',
        borderColor: '#fff',
        borderWidth: 1,
    },
    btnIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    btnText: {
        fontSize: 18,
    },
});

export default AuthModal;



// import { AuthStrategy, ModalType } from '@/types/enums';
// import { Ionicons } from '@expo/vector-icons';
// import { BottomSheetView } from '@gorhom/bottom-sheet';
// import { Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
// import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Colors from '@/constants/Colors';
// import { useRouter } from 'expo-router';


// interface AuthModalProps {
//     authType: ModalType | null;
// }

// const LOGIN_OPTIONS = [
//     {
//         text: 'Continue with Google',
//         icon: require('@/assets/images/login/google.png'),
//         strategy: AuthStrategy.Google,
//     },
//     {
//         text: 'Continue with Microsoft',
//         icon: require('@/assets/images/login/microsoft.png'),
//         strategy: AuthStrategy.Microsoft,
//     },
//     {
//         text: 'Continue with Apple',
//         icon: require('@/assets/images/login/apple.png'),
//         strategy: AuthStrategy.Apple,
//     },
//     {
//         text: 'Continue with Slack',
//         icon: require('@/assets/images/login/slack.png'),
//         strategy: AuthStrategy.Slack,
//     },
// ];

// const AuthModal = ({ authType }: AuthModalProps) => {
//     useWarmUpBrowser();
//     const { top } = useSafeAreaInsets();
//     const { startOAuthFlow: googleAuth } = useOAuth({ strategy: AuthStrategy.Google });
//     const { startOAuthFlow: microsoftAuth } = useOAuth({ strategy: AuthStrategy.Microsoft });
//     const { startOAuthFlow: slackAuth } = useOAuth({ strategy: AuthStrategy.Slack });
//     const { startOAuthFlow: appleAuth } = useOAuth({ strategy: AuthStrategy.Apple });
//     const { signUp, setActive } = useSignUp();
//     const { signIn } = useSignIn();

//     const onSelectedAuth = async (strategy: AuthStrategy) => {
//         // console.log(strategy)
//         if (!signIn || !signUp) return;

//         const selectedAuth = {
//             [AuthStrategy.Google]: googleAuth,
//             [AuthStrategy.Microsoft]: microsoftAuth,
//             [AuthStrategy.Slack]: slackAuth,
//             [AuthStrategy.Apple]: appleAuth,
//         }[strategy];

//         // https://clerk.com/docs/custom-flows/oauth-connections#o-auth-account-transfer-flows
//         // If the user has an account in your application, but does not yet
//         // have an OAuth account connected to it, you can transfer the OAuth
//         // account to the existing user account.
//         const userExistsButNeedsToSignIn =
//             signUp.verifications.externalAccount.status === 'transferable' &&
//             signUp.verifications.externalAccount.error?.code === 'external_account_exists';

//         if (userExistsButNeedsToSignIn) {
//             const res = await signIn.create({ transfer: true });

//             if (res.status === 'complete') {
//                 setActive({
//                     session: res.createdSessionId,
//                 });
//             }
//         }

//         const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

//         if (userNeedsToBeCreated) {
//             const res = await signUp.create({
//                 transfer: true,
//             });

//             if (res.status === 'complete') {
//                 setActive({
//                     session: res.createdSessionId,
//                 });
//             }
//         } else {
//             // If the user has an account in your application
//             // and has an OAuth account connected to it, you can sign them in.
//             try {
//                 const { createdSessionId, setActive } = await selectedAuth();

//                 if (createdSessionId) {
//                     setActive!({ session: createdSessionId });
//                     console.log('OAuth success standard');
//                 }
//             } catch (err) {
//                 console.error('OAuth error', err);
//             }
//         }
//     };
//     //     try {
//     //         const { createdSessionId, setActive } = await selectedAuth();

//     //         if (createdSessionId) {
//     //             setActive!({ session: createdSessionId });
//     //             console.log("Session Created!!!")
//     //         }
//     //     } catch (error) {
//     //         console.log('Error: ', error)
//     //     }
//     // }
//     const onPressPhoneAuth = () => {
//         const router = useRouter();
//         router.push('/screens/login')
//     }
//     return (
//         <BottomSheetView style={[styles.modalContainer]}>
//             <TouchableOpacity style={styles.modalBtn}
//             onPress={onPressPhoneAuth}>
//                 <Ionicons name="mail-outline" size={20} />
//                 <Text style={styles.btnText}>
//                     {authType === ModalType.Login ? 'Log in' : 'Sign up'} with Phone Number
//                 </Text>
//             </TouchableOpacity>
//             {LOGIN_OPTIONS.map((option, index) => (
//                 <TouchableOpacity
//                     key={index}
//                     style={styles.modalBtn}
//                     onPress={() => onSelectedAuth(option.strategy!)}>
//                     <Image source={option.icon} style={styles.btnIcon} />
//                     <Text style={styles.btnText}>{option.text}</Text>
//                 </TouchableOpacity>
//             ))}
//         </BottomSheetView>
//     );
// };

// const styles = StyleSheet.create({
//     modalContainer: {
//         flex: 1,
//         alignItems: 'flex-start',
//         padding: 20,
//         gap: 20,
//         backgroundColor: '#fff'
//     },
//     modalBtn: {
//         flexDirection: 'row',
//         gap: 14,
//         alignItems: 'center',
//         borderColor: '#fff',
//         borderWidth: 1,
//     },
//     btnIcon: {
//         width: 20,
//         height: 20,
//         resizeMode: 'contain',
//     },
//     btnText: {
//         fontSize: 18,
//     },
// });

// export default AuthModal;

// //     return (
// //         <View style={[styles.container,
// //         {
// //             paddingTop: top
// //         }
// //         ]}>
// //             <Text>
// //                 Hello Supabase and Clerk
// //             </Text>
// //         </View>
// //     )
// // }

// // export default AuthModal

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //         justifyContent: 'center',
// //         alignItems: 'center'
// //     }
// // })