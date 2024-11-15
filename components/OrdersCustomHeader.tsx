import { StyleSheet, Text, View, Animated, Pressable } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { BlurView } from 'expo-blur'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'

type OrderStatus = 'all' | 'active' | 'completed' | 'cancelled'

const OrdersCustomHeader = () => {
    const { top } = useSafeAreaInsets()
    const navigation = useNavigation()
    const router = useRouter()
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(-20)).current
    const [activeTab, setActiveTab] = useState<OrderStatus>('all')

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

    const onSearchPress = () => {
        router.push('/(authenticated)/(tabs)/Home')
    }

    const onFilterPress = () => {
        // Implement filter modal or navigation
    }

    const tabs: { key: OrderStatus; label: string; count?: number }[] = [
        { key: 'all', label: 'All', count: 12 },
        { key: 'active', label: 'Active', count: 3 },
        { key: 'completed', label: 'Completed', count: 8 },
        { key: 'cancelled', label: 'Cancelled', count: 1 },
    ]

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
                    <View style={styles.topRow}>
                        <View style={styles.leftSection}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={onToggle}
                                activeOpacity={0.7}
                            >
                                <Feather name="menu" size={24} color="#333" />
                            </TouchableOpacity>

                            <View style={styles.headerContainer}>
                                <MaterialIcons name="local-shipping" size={24} color="#333" />
                                <Text style={styles.headerText}>My Orders</Text>
                            </View>
                        </View>

                        <View style={styles.rightSection}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={onSearchPress}
                                activeOpacity={0.7}
                            >
                                <Feather name="search" size={24} color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={onFilterPress}
                                activeOpacity={0.7}
                            >
                                <Feather name="filter" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs Section */}
                    <Animated.ScrollView 
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContainer}
                        style={[
                            styles.tabsScrollView,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        {tabs.map((tab) => (
                            <Pressable
                                key={tab.key}
                                style={[
                                    styles.tab,
                                    activeTab === tab.key && styles.activeTab
                                ]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <Text 
                                    style={[
                                        styles.tabText,
                                        activeTab === tab.key && styles.activeTabText
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                                {tab.count !== undefined && (
                                    <View 
                                        style={[
                                            styles.countBadge,
                                            activeTab === tab.key && styles.activeCountBadge
                                        ]}
                                    >
                                        <Text 
                                            style={[
                                                styles.countText,
                                                activeTab === tab.key && styles.activeCountText
                                            ]}
                                        >
                                            {tab.count}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </Animated.ScrollView>
                </Animated.View>
            </BlurView>
        </>
    )
}

export default OrdersCustomHeader

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
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
    tabsScrollView: {
        marginTop: 8,
    },
    tabsContainer: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        gap: 6,
    },
    activeTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    countBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    activeCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    countText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    activeCountText: {
        color: '#FFFFFF',
    },
})