import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import splashScreen from '@/assets/images/splashing.jpeg'; // Correct the import if needed
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SplashScreenView = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.headerText}>MoveEasy</Text>
        {/* <Image source={splashScreen} style={styles.image} /> */}
      </View>
    </SafeAreaView>
  );
};

export default SplashScreenView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e'
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'orange',
    fontStyle: 'italic'
  }
});
