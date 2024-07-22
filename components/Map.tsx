import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Mapbox, { MapView } from '@rnmapbox/maps';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

Mapbox.setAccessToken(accessToken);


const Map = () => {
    return (
        <View>
            <MapView style={{ flex: 1 }} />
        </View>
    )
}

export default Map

const styles = StyleSheet.create({})