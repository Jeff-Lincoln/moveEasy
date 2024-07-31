import { StyleSheet, Text, Touchable, View } from 'react-native'
import React from 'react'
import { BlurView } from 'expo-blur'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

const VehicleDetailCustomHeader = () => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();

    const onToggle = () => {
        navigation.dispatch(DrawerActions.toggleDrawer())
    }

    const onClosePress = () => {
        router.push('home')
    }

    return (
        <>
            <StatusBar style='dark' />
            <View style={{ paddingTop: top }}>
                <View style={styles.container}>
                    <TouchableOpacity style={styles.roundButton}
                        onPress={onToggle}>
                        <Entypo name="menu" size={26} color="black" />
                        {/* <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>JL</Text> */}
                    </TouchableOpacity>
                    <View style={styles.headerStyle}>
                        {/* <FontAwesome5 name="truck" size={24} color="#000" /> */}
                        <Text style={styles.headerText}>Vehicle Details</Text>
                    </View>
                    {/* <View style={styles.searchSection}>
                        <Ionicons
                            style={styles.searchIcon}
                            name='search' size={20} color={Colors.dark} />
                        <TextInput style={styles.input}
                            placeholder='Search'
                            placeholderTextColor={Colors.dark} />
                    </View> */}
                    <View>
                        <TouchableOpacity onPress={onClosePress}>
                            <FontAwesome name="close" size={30} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* <View style={styles.circle}>
                        <TouchableOpacity style={styles.roundButton}>
                            <MaterialIcons name="my-location" size={20} color="black" />
                        </TouchableOpacity>
                    </View> */}
                </View>
            </View>
        </>
    )
}

export default VehicleDetailCustomHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#fff',
        gap: 10,
        paddingHorizontal: 20,
    },
    roundButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: Colors.lightGray,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: 'center',

    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        color: Colors.dark,
    },
    searchIcon: {
        padding: 10
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 24,
        color: '#000'
    }
})