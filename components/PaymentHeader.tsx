import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'

const PaymentHeader = () => {
    const { top } = useSafeAreaInsets()
    const navigation = useNavigation()
    const router = useRouter()
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(-20)).current

    const startEntryAnimation = () => {
        fadeAnim.setValue(0)
        slideAnim.setValue(-20)

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
    }

    useEffect(() => {
        startEntryAnimation()
        const unsubscribe = navigation.addListener('focus', () => {
            startEntryAnimation()
        })
        return unsubscribe
    }, [navigation])

    const onToggle = () => {
        navigation.dispatch(DrawerActions.toggleDrawer())
    }

    const onClosePress = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            router.push('/Home')
        })
    }

    const onHelpPress = () => {
        // Handle help/support navigation
        router.push('/(authenticated)/(tabs)/Profile')
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
                            transform: [{
                                translateY: slideAnim
                            }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onToggle}
                        activeOpacity={0.7}
                    >
                        <Feather name="menu" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <Feather name="credit-card" size={24} color="#333" />
                        <Text style={styles.headerText}>Payment</Text>
                    </View>

                    <View style={styles.rightButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onHelpPress}
                            activeOpacity={0.7}
                        >
                            <Feather name="help-circle" size={24} color="#333" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onClosePress}
                            activeOpacity={0.7}
                        >
                            <Feather name="x" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Optional Payment Summary Bar */}
                <Animated.View 
                    style={[
                        styles.summaryBar,
                        {
                            opacity: fadeAnim,
                            transform: [{
                                translateY: slideAnim
                            }]
                        }
                    ]}
                >
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Amount Due</Text>
                        <Text style={styles.summaryValue}>$150.00</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Due Date</Text>
                        <Text style={styles.summaryValue}>Nov 15</Text>
                    </View>
                </Animated.View>
            </BlurView>
        </>
    )
}

export default PaymentHeader

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
    rightButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    summaryBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    summaryItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
})