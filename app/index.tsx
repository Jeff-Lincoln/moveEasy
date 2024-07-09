import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import image from '@/assets/images/homePage.jpeg';
import { Link } from 'expo-router';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';

const IMAGE = Image.resolveAssetSource(image).uri;


const index = () => {
  return (
    <View style={styles.container}>
      <StatusBar style='dark' />
      <ImageBackground source={{ uri: IMAGE }} style={styles.image} />
      <View style={{ marginTop: 40, padding: 20 }}>
        <Text style={styles.headerText}>Simplify Your Relocation Experience!</Text>
      </View>

      <View style={styles.buttons}>
        <Link href={'/screens/login'}
          style={[defaultStyles.pillButton, { flex: 1, backgroundColor: Colors.dark }]}
          asChild>
          <TouchableOpacity>
            <Text style={{ color: "white", fontSize: 22, fontWeight: '500' }}>Login</Text>
          </TouchableOpacity>
        </Link>
        <Link href={'/screens/signUp'}
          style={[defaultStyles.pillButton, { flex: 1, backgroundColor: 'white' }]}
          asChild>
          <TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: '500' }}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between'
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  headerText: {
    fontSize: 36,
    fontWeight: "900",
    color: 'white'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 60
  }
})