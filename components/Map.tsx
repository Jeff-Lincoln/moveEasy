import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Mapbox, { MapView } from '@rnmapbox/maps';

const accessToken = 'pk.eyJ1IjoiamVmZmxpbmNvbG4iLCJhIjoiY2x5OTVoaXh1MG05MTJzc2F5cWMzeXB3YSJ9.hlvBfPhtmDYpMtWZnfiTSQ';

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