import { StyleSheet, Text, View, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { BlurView } from 'expo-blur'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useUser } from '@clerk/clerk-expo'

const ProfileCustomHeader = () => {
    const { top } = useSafeAreaInsets()
    const navigation = useNavigation()
    const router = useRouter()
    const { user } = useUser()
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(-20)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start()
    }, [])

    const onToggle = () => {
        navigation.dispatch(DrawerActions.toggleDrawer())
    }

    const onSettingsPress = () => {
        router.push('/screens/help')
    }

    const onNotificationsPress = () => {
        router.push('/screens/help')
    }

    return (
        <>
            <StatusBar style="dark" />
            <BlurView intensity={90} tint="light" style={{ paddingTop: top }}>
                <Animated.View 
                    style={[
                        styles.container,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.leftSection}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onToggle}
                            activeOpacity={0.7}
                        >
                            <Feather name="menu" size={24} color="#333" />
                        </TouchableOpacity>

                        <View style={styles.headerContainer}>
                            <MaterialIcons name="account-circle" size={24} color="#333" />
                            <Text style={styles.headerText}>
                                {user?.firstName || 'Profile'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onNotificationsPress}
                            activeOpacity={0.7}
                        >
                            <View>
                                <Ionicons name="notifications-outline" size={24} color="#333" />
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>2</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onSettingsPress}
                            activeOpacity={0.7}
                        >
                            <Feather name="settings" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Optional: Animated Subtitle */}
                <Animated.View
                    style={[
                        styles.subtitleContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.subtitleText}>
                        View and manage your profile
                    </Text>
                </Animated.View>
            </BlurView>
        </>
    )
}

export default ProfileCustomHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        letterSpacing: 0.3,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#007AFF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    subtitleContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    subtitleText: {
        fontSize: 14,
        color: '#666',
        letterSpacing: 0.2,
    },
})