import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { geoCoding } from '@/services/geoCoding';
import { getDirections } from '@/services/directions';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setOrigin, setDestination, setDistance, setDuration } from '@/app/context/slices/navSlice';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v10';
const INITIAL_ZOOM = 14;
const ANIMATION_DURATION = 2000;
const AVERAGE_SPEED_KMH = 60;

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

const MapScreen = () => {
  const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
  const [distance, setDistanceState] = useState<string | null>(null);
  const [duration, setDurationState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [infoBoxVisible] = useState(new Animated.Value(0));
  const [mapReady, setMapReady] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const cameraRef = useRef<Camera>(null);
  const mapRef = useRef<MapView>(null);
  const lottieRef = useRef<LottieView>(null);
  
  const snapPoints = ['25%', '50%', '80%'];

  useEffect(() => {
    if (distance) {
      Animated.spring(infoBoxVisible, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [distance]);

  const handleMapReady = () => {
    setMapReady(true);
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  };

  const handleSheetClose = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  };

  const convertDurationToHoursMinutes = (durationHours: number) => {
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const calculateDistanceAndDuration = (start: number[], end: number[]) => {
    const R = 6371e3;
    const φ1 = (start[1] * Math.PI) / 180;
    const φ2 = (end[1] * Math.PI) / 180;
    const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
    const Δλ = ((end[0] - start[0]) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = (R * c) / 1000;
    const durationHrs = distanceKm / AVERAGE_SPEED_KMH;

    return { 
      distance: `${distanceKm.toFixed(2)} km`, 
      duration: convertDurationToHoursMinutes(durationHrs),
    };
  };

  const fetchLocationCoordinates = async () => {
    try {
      const [pickup, destination] = await geoCoding(fromLocation, toLocation);
      setPickupCoords(pickup);
      setDestinationCoords(destination);

      if (pickup) dispatch(setOrigin({ latitude: pickup[1], longitude: pickup[0], address: fromLocation }));
      if (destination) dispatch(setDestination({ latitude: destination[1], longitude: destination[0], address: toLocation }));
      
      return { pickup, destination };
    } catch (error) {
      Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
      throw error;
    }
  };

  const handleGetDirections = async () => {
    if (!fromLocation || !toLocation) {
      Alert.alert('Input Error', 'Please enter both pickup and destination locations');
      return;
    }

    setIsLoading(true);
    setShowLoader(true);

    try {
      const { pickup, destination } = await fetchLocationCoordinates();
      if (pickup && destination) {
        const directions = await getDirections({ pickupCoordinates: pickup, destinationCoordinates: destination });
        setRouteCoordinates(directions);

        const { distance, duration } = calculateDistanceAndDuration(pickup, destination);
        setDistanceState(distance);
        setDurationState(duration);

        dispatch(setDistance(parseFloat(distance)));
        dispatch(setDuration(parseFloat(duration)));

        cameraRef.current?.flyTo({ 
          center: [(pickup[0] + destination[0]) / 2, (pickup[1] + destination[1]) / 2], 
          zoomLevel: INITIAL_ZOOM, 
          duration: ANIMATION_DURATION 
        });
        
        handleSheetClose();
      }
    } catch (error) {
      console.error('Direction Error:', error);
      Alert.alert('Error', 'Failed to get directions. Please try again.');
    } finally {
      setIsLoading(false);
      setShowLoader(false);
    }
  };

  const renderBackdrop = useCallback((props: any) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={1}
      disappearsOnIndex={0}
      pressBehavior="close"
    />
  ), []);

  const LoadingModal = () => (
    <Modal transparent animationType="fade">
      <BlurView intensity={80} style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <LottieView
            ref={lottieRef}
            source={require('@/assets/animations/map_loading.json')}
            style={styles.lottieAnimation}
            autoPlay
            loop
          />
          <Text style={styles.loaderText}>Finding the best route for you...</Text>
          <Text style={styles.loaderSubText}>This may take a moment</Text>
        </View>
      </BlurView>
    </Modal>
  );

  if (!accessToken) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF5252" />
        <Text style={styles.errorText}>Map access token is required</Text>
      </SafeAreaView>
    );
  }

  Mapbox.setAccessToken(accessToken);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {showLoader && <LoadingModal />}

      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAP_STYLE}
        zoomEnabled
        rotateEnabled
        onDidFinishLoadingMap={handleMapReady}
      >
        <Camera
          ref={cameraRef}
          followUserLocation
          followZoomLevel={INITIAL_ZOOM}
          animationMode="flyTo"
        />
        <LocationPuck
          visible
          pulsing={{
            isEnabled: true,
            color: '#FF9800',
            radius: 100,
          }}
        />

        {pickupCoords && (
          <ShapeSource
            id="pickupPoint"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: pickupCoords,
              },
            }}
          >
            <SymbolLayer
              id="pickupSymbol"
              style={{
                iconImage: 'mapbox://markers/pickup-pin',
                iconSize: 1.5,
                iconOffset: [0, -15],
              }}
            />
          </ShapeSource>
        )}

        {destinationCoords && (
          <ShapeSource
            id="destinationPoint"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: destinationCoords,
              },
            }}
          >
            <SymbolLayer
              id="destinationSymbol"
              style={{
                iconImage: 'mapbox://markers/destination-pin',
                iconSize: 1.5,
                iconOffset: [0, -15],
              }}
            />
          </ShapeSource>
        )}

        {routeCoordinates && (
          <ShapeSource
            id="routeLine"
            lineMetrics
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates,
              },
            }}
          >
            <LineLayer
              id="routeLine"
              style={{
                lineWidth: 4,
                lineColor: '#FF9800',
                lineCap: 'round',
                lineJoin: 'round',
                lineGradient: [
                  'interpolate',
                  ['linear'],
                  ['line-progress'],
                  0,
                  '#FF9800',
                  1,
                  '#4CAF50',
                ],
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      <Animated.View style={[styles.infoBox, { opacity: infoBoxVisible }]}>
        <BlurView intensity={80} style={styles.infoBoxContent}>
          {distance && (
            <View style={styles.infoRow}>
              <MaterialIcons name="directions-car" size={20} color="#FFF" />
              <Text style={styles.infoText}>Distance: {distance}</Text>
            </View>
          )}
          {duration && (
            <View style={styles.infoRow}>
              <MaterialIcons name="access-time" size={20} color="#FFF" />
              <Text style={styles.infoText}>Duration: {duration}</Text>
            </View>
          )}
        </BlurView>
      </Animated.View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => bottomSheetRef.current?.snapToIndex(0)}
        >
          <MaterialIcons name="location-on" size={24} color="white" />
          <Text style={styles.buttonText}>Enter Location</Text>
        </TouchableOpacity>

        {distance && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/(authenticated)/(tabs)/vehicles')}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <MaterialIcons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheet}
        index={-1}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Enter Route Details</Text>
          <TouchableOpacity onPress={handleSheetClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.sheetContent}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="location-on" size={24} color="#FF9800" />
            <BottomSheetTextInput
              placeholder="Pickup Location"
              value={fromLocation}
              onChangeText={setFromLocation}
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="location-searching" size={24} color="#4CAF50" />
            <BottomSheetTextInput
              placeholder="Destination"
              value={toLocation}
              onChangeText={setToLocation}
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <TouchableOpacity
            style={[styles.directionButton, isLoading && styles.directionButtonDisabled]}
            onPress={handleGetDirections}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.directionButtonText}>Get Directions</Text>
                <MaterialIcons name="directions" size={24} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1C1C1E',
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    width: width * 0.8,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loaderText: {
    color: '#0ffc6a',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  loaderSubText: {
    color: '#0ffc6a',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  map: {
    flex: 1,
  },
  infoBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  infoBoxContent: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '500',
  },
  actionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  bottomSheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sheetTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  sheetContent: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3C3C3E',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 8,
  },
  directionButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  directionButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.8,
  },
  directionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default MapScreen;


// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
//   Keyboard,
// } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { geoCoding } from '@/services/geoCoding';
// import { getDirections } from '@/services/directions';
// import { useRouter } from 'expo-router';
// import { useDispatch } from 'react-redux';
// import { setOrigin, setDestination, setDistance, setDuration } from '@/app/context/slices/navSlice';
// import { MaterialIcons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');
// const MAP_STYLE = 'mapbox://styles/mapbox/dark-v10';
// const INITIAL_ZOOM = 14;
// const ANIMATION_DURATION = 2000;
// const AVERAGE_SPEED_KMH = 60;

// const MapScreen = () => {
//   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//   const [fromLocation, setFromLocation] = useState('');
//   const [toLocation, setToLocation] = useState('');
//   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
//   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
//   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
//   const [distance, setDistanceState] = useState<string | null>(null);
//   const [duration, setDurationState] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showLoader, setShowLoader] = useState(false);

//   const router = useRouter();
//   const dispatch = useDispatch();
//   const bottomSheetRef = useRef<BottomSheet>(null);
//   const cameraRef = useRef<Camera>(null);
//   const snapPoints = ['25%', '50%', '80%'];

//   const handleSheetClose = () => {
//     Keyboard.dismiss();
//     bottomSheetRef.current?.close();
//   };

//   const convertDurationToHoursMinutes = (durationHours) => {
//     const hours = Math.floor(durationHours);
//     const minutes = Math.round((durationHours - hours) * 60);
//     return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
//   };

//   const calculateDistanceAndDuration = (start, end) => {
//     const R = 6371e3;
//     const φ1 = (start[1] * Math.PI) / 180;
//     const φ2 = (end[1] * Math.PI) / 180;
//     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
//     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;
//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distanceKm = (R * c) / 1000;
//     const durationHrs = distanceKm / AVERAGE_SPEED_KMH;

//     return { 
//       distance: `${distanceKm.toFixed(2)} km`, 
//       duration: convertDurationToHoursMinutes(durationHrs),
//     };
//   };

//   const fetchLocationCoordinates = async () => {
//     try {
//       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
//       setPickupCoords(pickup);
//       setDestinationCoords(destination);

//       if (pickup) dispatch(setOrigin({ latitude: pickup[1], longitude: pickup[0], address: fromLocation }));
//       if (destination) dispatch(setDestination({ latitude: destination[1], longitude: destination[0], address: toLocation }));
      
//       return { pickup, destination };
//     } catch (error) {
//       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
//       throw error;
//     }
//   };

//   const handleGetDirections = async () => {
//     if (!fromLocation || !toLocation) {
//       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
//       return;
//     }

//     setIsLoading(true);
//     setShowLoader(true);

//     try {
//       const { pickup, destination } = await fetchLocationCoordinates();
//       if (pickup && destination) {
//         const directions = await getDirections({ pickupCoordinates: pickup, destinationCoordinates: destination });
//         setRouteCoordinates(directions);

//         const { distance, duration } = calculateDistanceAndDuration(pickup, destination);
//         setDistanceState(distance);
//         setDurationState(duration);

//         dispatch(setDistance(parseFloat(distance)));
//         dispatch(setDuration(parseFloat(duration)));

//         cameraRef.current?.flyTo({ center: [(pickup[0] + destination[0]) / 2, (pickup[1] + destination[1]) / 2], zoomLevel: INITIAL_ZOOM, duration: ANIMATION_DURATION });
//         handleSheetClose();
//       }
//     } catch (error) {
//       console.error('Direction Error:', error);
//     } finally {
//       setIsLoading(false);
//       setShowLoader(false);
//     }
//   };

//   const renderBackdrop = useCallback((props) => (
//     <BottomSheetBackdrop appearsOnIndex={1} disappearsOnIndex={0} {...props} />
//   ), []);

//   if (!accessToken) {
//     return (
//       <SafeAreaView style={styles.errorContainer}>
//         <MaterialIcons name="error-outline" size={48} color="red" />
//         <Text style={styles.errorText}>Map access token is required</Text>
//       </SafeAreaView>
//     );
//   }

//   Mapbox.setAccessToken(accessToken);

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar style="light" />
//       {showLoader && (
//         <Modal transparent animationType="fade">
//           <View style={styles.loaderContainer}>
//             <ActivityIndicator size="large" color="#FF9800" />
//             <Text style={styles.loaderText}>Finding the best route...</Text>
//           </View>
//         </Modal>
//       )}

//       <MapView style={styles.map} styleURL={MAP_STYLE} zoomEnabled rotateEnabled>
//         <Camera ref={cameraRef} followUserLocation followZoomLevel={INITIAL_ZOOM} animationMode="flyTo" />
//         <LocationPuck visible pulsing={{ isEnabled: true, color: '#FF9800', radius: 100 }} />

//         {pickupCoords && (
//           <ShapeSource id="pickupPoint" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: pickupCoords } }}>
//             <SymbolLayer id="pickupSymbol" style={{ iconImage: 'mapbox://markers/pickup-pin', iconSize: 1.5, iconOffset: [0, -15] }} />
//           </ShapeSource>
//         )}

//         {destinationCoords && (
//           <ShapeSource id="destinationPoint" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: destinationCoords } }}>
//             <SymbolLayer id="destinationSymbol" style={{ iconImage: 'mapbox://markers/destination-pin', iconSize: 1.5, iconOffset: [0, -15] }} />
//           </ShapeSource>
//         )}

//         {routeCoordinates && (
//           <ShapeSource id="routeLine" lineMetrics shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } }}>
//             <LineLayer id="routeLine" style={{ lineWidth: 4, lineColor: '#FF9800', lineGradient: ['interpolate', ['linear'], ['line-progress'], 0, '#FF9800', 1, '#4CAF50'] }} />
//           </ShapeSource>
//         )}
//       </MapView>

//       <View style={styles.infoBox}>
//         {distance && <Text style={styles.infoText}>Distance: {distance}</Text>}
//         {duration && <Text style={styles.infoText}>Duration: {duration}</Text>}
//       </View>

//       <View style={styles.actionContainer}>
//         <TouchableOpacity style={styles.locationButton} onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
//           <MaterialIcons name="location-on" size={24} color="white" />
//           <Text style={styles.buttonText}>Enter Location</Text>
//         </TouchableOpacity>

//         {distance && (
//           <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/(authenticated)/(tabs)/vehicles')}>
//             <Text style={styles.buttonText}>Continue</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints} backdropComponent={renderBackdrop} style={styles.bottomSheet}>
//         <SafeAreaView style={styles.sheetContent}>
//           <BottomSheetTextInput
//             placeholder="Pickup Location"
//             value={fromLocation}
//             onChangeText={setFromLocation}
//             style={styles.input}
//           />
//           <BottomSheetTextInput
//             placeholder="Destination"
//             value={toLocation}
//             onChangeText={setToLocation}
//             style={styles.input}
//           />
//           <TouchableOpacity style={styles.directionButton} onPress={handleGetDirections}>
//             {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.directionButtonText}>Get Directions</Text>}
//           </TouchableOpacity>
//         </SafeAreaView>
//       </BottomSheet>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#000' },
//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   errorText: { color: '#FFF', fontSize: 18, marginTop: 12 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
//   loaderText: { color: '#FFF', fontSize: 16, marginTop: 10 },
//   map: { flex: 1 },
//   infoBox: { position: 'absolute', top: 20, left: 10, backgroundColor: '#333', borderRadius: 10, padding: 10 },
//   infoText: { color: '#FFF', fontSize: 14 },
//   actionContainer: { position: 'absolute', bottom: 30, left: 10, flexDirection: 'row', justifyContent: 'space-between', width: width - 20 },
//   locationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2196F3', padding: 15, borderRadius: 10 },
//   continueButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10 },
//   buttonText: { color: '#FFF', fontSize: 16 },
//   bottomSheet: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
//   sheetContent: { paddingHorizontal: 20 },
//   input: { backgroundColor: '#FFF', borderRadius: 8, padding: 10, marginVertical: 8, borderColor: '#CCC', borderWidth: 1 },
//   directionButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
//   directionButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
// });

// export default MapScreen;





// // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // import {
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// //   Alert,
// //   ActivityIndicator,
// //   Modal,
// //   Dimensions,
// //   Keyboard,
// // } from 'react-native';
// // import { StatusBar } from 'expo-status-bar';
// // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // import { geoCoding } from '@/services/geoCoding';
// // import { getDirections } from '@/services/directions';
// // import { useRouter } from 'expo-router';
// // import { useDispatch } from 'react-redux';
// // import { setOrigin, setDestination, setDistance, setDuration } from '@/app/context/slices/navSlice';
// // import { MaterialIcons } from '@expo/vector-icons';

// // const { width, height } = Dimensions.get('window');
// // const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';
// // const INITIAL_ZOOM = 14;
// // const ANIMATION_DURATION = 2000;
// // const AVERAGE_SPEED_KMH = 60;

// // const MapScreen = () => {
// //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// //   const [fromLocation, setFromLocation] = useState('');
// //   const [toLocation, setToLocation] = useState('');
// //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// //   const [distance, setDistanceState] = useState<string | null>(null);
// //   const [duration, setDurationState] = useState<string | null>(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [showLoader, setShowLoader] = useState(false);

// //   const router = useRouter();
// //   const dispatch = useDispatch();
// //   const bottomSheetRef = useRef<BottomSheet>(null);
// //   const cameraRef = useRef<Camera>(null);
// //   const snapPoints = ['30%', '50%', '80%'];

// //   const handleSheetClose = () => {
// //     Keyboard.dismiss();
// //     bottomSheetRef.current?.close();
// //   };

// //   const convertDurationToHoursMinutes = (durationHours: number) => {
// //     const hours = Math.floor(durationHours);
// //     const minutes = Math.round((durationHours - hours) * 60);
// //     return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
// //   };

// //   const calculateDistanceAndDuration = (start: number[], end: number[]) => {
// //     const R = 6371e3;
// //     const φ1 = (start[1] * Math.PI) / 180;
// //     const φ2 = (end[1] * Math.PI) / 180;
// //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;
// //     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// //     const distanceKm = (R * c) / 1000;
// //     const durationHrs = distanceKm / AVERAGE_SPEED_KMH;

// //     return { 
// //       distance: `${distanceKm.toFixed(2)} km`, 
// //       duration: convertDurationToHoursMinutes(durationHrs),
// //     };
// //   };

// //   const fetchLocationCoordinates = async () => {
// //     try {
// //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// //       setPickupCoords(pickup);
// //       setDestinationCoords(destination);

// //       if (pickup) dispatch(setOrigin({ latitude: pickup[1], longitude: pickup[0], address: fromLocation }));
// //       if (destination) dispatch(setDestination({ latitude: destination[1], longitude: destination[0], address: toLocation }));
      
// //       return { pickup, destination };
// //     } catch (error) {
// //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// //       throw error;
// //     }
// //   };

// //   const handleGetDirections = async () => {
// //     if (!fromLocation || !toLocation) {
// //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// //       return;
// //     }

// //     setIsLoading(true);
// //     setShowLoader(true);

// //     try {
// //       const { pickup, destination } = await fetchLocationCoordinates();
// //       if (pickup && destination) {
// //         const directions = await getDirections({ pickupCoordinates: pickup as [number, number], destinationCoordinates: destination as [number, number] });
// //         setRouteCoordinates(directions);

// //         const { distance, duration } = calculateDistanceAndDuration(pickup, destination);
// //         setDistanceState(distance);
// //         setDurationState(duration);

// //         dispatch(setDistance(parseFloat(distance)));
// //         dispatch(setDuration(parseFloat(duration)));

// //         cameraRef.current?.flyTo({ center: [(pickup[0] + destination[0]) / 2, (pickup[1] + destination[1]) / 2], zoomLevel: INITIAL_ZOOM, duration: ANIMATION_DURATION });
// //         handleSheetClose();
// //       }
// //     } catch (error) {
// //       console.error('Direction Error:', error);
// //     } finally {
// //       setIsLoading(false);
// //       setShowLoader(false);
// //     }
// //   };

// //   const renderBackdrop = useCallback((props) => (
// //     <BottomSheetBackdrop appearsOnIndex={1} disappearsOnIndex={0} {...props} />
// //   ), []);

// //   if (!accessToken) {
// //     return (
// //       <SafeAreaView style={styles.errorContainer}>
// //         <MaterialIcons name="error-outline" size={48} color="red" />
// //         <Text style={styles.errorText}>Map access token is required</Text>
// //       </SafeAreaView>
// //     );
// //   }

// //   Mapbox.setAccessToken(accessToken);

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar style="light" />
// //       {showLoader && (
// //         <Modal transparent animationType="fade">
// //           <View style={styles.loaderContainer}>
// //             <ActivityIndicator size="large" color="#FF9800" />
// //             <Text style={styles.loaderText}>Finding the best route...</Text>
// //           </View>
// //         </Modal>
// //       )}

// //       <MapView style={styles.map} styleURL={MAP_STYLE} zoomEnabled rotateEnabled>
// //         <Camera ref={cameraRef} followUserLocation followZoomLevel={INITIAL_ZOOM} animationMode="flyTo" />
// //         <LocationPuck visible pulsing={{ isEnabled: true, color: '#FF9800', radius: 100 }} />

// //         {pickupCoords && (
// //           <ShapeSource id="pickupPoint" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: pickupCoords } }}>
// //             <SymbolLayer id="pickupSymbol" style={{ iconImage: 'mapbox://markers/pickup-pin', iconSize: 1.5, iconOffset: [0, -15] }} />
// //           </ShapeSource>
// //         )}

// //         {destinationCoords && (
// //           <ShapeSource id="destinationPoint" shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: destinationCoords } }}>
// //             <SymbolLayer id="destinationSymbol" style={{ iconImage: 'mapbox://markers/destination-pin', iconSize: 1.5, iconOffset: [0, -15] }} />
// //           </ShapeSource>
// //         )}

// //         {routeCoordinates && (
// //           <ShapeSource id="routeLine" lineMetrics shape={{ type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoordinates } }}>
// //             <LineLayer id="routeLine" style={{ lineWidth: 4, lineColor: '#FF9800', lineGradient: ['interpolate', ['linear'], ['line-progress'], 0, '#FF9800', 1, '#4CAF50'] }} />
// //           </ShapeSource>
// //         )}
// //       </MapView>

// //       <View style={styles.actionContainer}>
// //         <TouchableOpacity style={styles.locationButton} onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
// //           <MaterialIcons name="location-on" size={24} color="white" />
// //           <Text style={styles.buttonText}>Enter Location</Text>
// //         </TouchableOpacity>

// //         {distance && (
// //           <TouchableOpacity style={styles.continueButton} onPress={() => router.push('/(authenticated)/(tabs)/vehicles')}>
// //             <Text style={styles.buttonText}>Continue</Text>
// //           </TouchableOpacity>
// //         )}
// //       </View>

// //       {distance && duration && (
// //         <View style={styles.infoBox}>
// //           <Text style={styles.infoText}>Distance: {distance}</Text>
// //           <Text style={styles.infoText}>Duration: {duration}</Text>
// //         </View>
// //       )}

// //       <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints} backdropComponent={renderBackdrop} enablePanDownToClose>
// //         <View style={styles.sheetContent}>
// //           <Text style={styles.inputLabel}>Pickup Location</Text>
// //           <BottomSheetTextInput style={styles.input} placeholder="Enter pickup location" value={fromLocation} onChangeText={setFromLocation} />

// //           <Text style={styles.inputLabel}>Destination</Text>
// //           <BottomSheetTextInput style={styles.input} placeholder="Enter destination" value={toLocation} onChangeText={setToLocation} />

// //           <TouchableOpacity style={styles.getDirectionButton} onPress={handleGetDirections} disabled={isLoading}>
// //             {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Get Directions</Text>}
// //           </TouchableOpacity>
// //         </View>
// //       </BottomSheet>
// //     </SafeAreaView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#fff' },
// //   map: { flex: 1 },
// //   actionContainer: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
// //   locationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9800', padding: 12, borderRadius: 8 },
// //   continueButton: { marginTop: 10, backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 },
// //   buttonText: { color: '#fff', fontSize: 16 },
// //   infoBox: { position: 'absolute', top: 20, left: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8 },
// //   infoText: { color: '#fff', fontSize: 14 },
// //   sheetContent: { paddingHorizontal: 20, paddingVertical: 10 },
// //   inputLabel: { fontSize: 16, marginBottom: 5 },
// //   input: { padding: 10, borderColor: '#ddd', borderWidth: 1, borderRadius: 5, marginBottom: 10 },
// //   getDirectionButton: { backgroundColor: '#FF9800', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
// //   loaderText: { color: '#FF9800', fontSize: 16, marginTop: 10 },
// //   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// //   errorText: { color: 'red', fontSize: 18, marginTop: 10 },
// // });

// // export default MapScreen;

// // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // import {
// // //   StyleSheet,
// // //   Text,
// // //   TouchableOpacity,
// // //   View,
// // //   Alert,
// // //   ActivityIndicator,
// // //   Modal,
// // //   Dimensions,
// // //   Keyboard,
// // // } from 'react-native';
// // // import { StatusBar } from 'expo-status-bar';
// // // import Mapbox, {
// // //   Camera,
// // //   LineLayer,
// // //   LocationPuck,
// // //   MapView,
// // //   ShapeSource,
// // //   SymbolLayer,
// // // } from '@rnmapbox/maps';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import BottomSheet, {
// // //   BottomSheetBackdrop,
// // //   BottomSheetTextInput,
// // // } from '@gorhom/bottom-sheet';
// // // import { geoCoding } from '@/services/geoCoding';
// // // import { getDirections } from '@/services/directions';
// // // import { useRouter } from 'expo-router';
// // // import { useDispatch } from 'react-redux';
// // // import { setOrigin, setDestination, setDistance, setDuration } from '@/app/context/slices/navSlice';
// // // import { MaterialIcons } from '@expo/vector-icons';

// // // const { width, height } = Dimensions.get('window');
// // // const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';
// // // const INITIAL_ZOOM = 14;
// // // const ANIMATION_DURATION = 2000;
// // // const AVERAGE_SPEED_KMH = 60; // Assumed average speed in km/h

// // // const MapScreen = () => {
// // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // //   const [fromLocation, setFromLocation] = useState('');
// // //   const [toLocation, setToLocation] = useState('');
// // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // //   const [distance, setDistanceState] = useState<string | null>(null);
// // //   const [duration, setDurationState] = useState<string | null>(null);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [showLoader, setShowLoader] = useState(false);

// // //   const router = useRouter();
// // //   const dispatch = useDispatch();
// // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // //   const cameraRef = useRef<Camera>(null);

// // //   const snapPoints = ['30%', '50%', '80%'];

// // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(0);
// // //   const handleSheetClose = () => {
// // //     Keyboard.dismiss();
// // //     bottomSheetRef.current?.close();
// // //   };

// // //   const convertDurationToHoursMinutes = (durationHours: number): string => {
// // //     const hours = Math.floor(durationHours);
// // //     const minutes = Math.round((durationHours - hours) * 60);
// // //     return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
// // //   };

// // //   const calculateDistanceAndDuration = (start: number[], end: number[]): { distance: string, duration: string } => {
// // //     if (!start || !end) return { distance: 'N/A', duration: 'N/A' };

// // //     const R = 6371e3; // Earth's radius in meters
// // //     const φ1 = (start[1] * Math.PI) / 180;
// // //     const φ2 = (end[1] * Math.PI) / 180;
// // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // //     const a =
// // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // //     const distanceKm = (R * c) / 1000; // Convert to kilometers
// // //     const durationHrs = distanceKm / AVERAGE_SPEED_KMH; // Duration in hours
// // //     const formattedDuration = convertDurationToHoursMinutes(durationHrs);

// // //     return { 
// // //       distance: `${distanceKm.toFixed(2)} km`, 
// // //       duration: formattedDuration
// // //     };
// // //   };

// // //   const fetchLocationCoordinates = async () => {
// // //     try {
// // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // //       setPickupCoords(pickup);
// // //       setDestinationCoords(destination);

// // //       if (pickup) dispatch(setOrigin({ latitude: pickup[1], longitude: pickup[0], address: fromLocation }));
// // //       if (destination) dispatch(setDestination({ latitude: destination[1], longitude: destination[0], address: toLocation }));

// // //       return { pickup, destination };
// // //     } catch (error: any) {
// // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // //       throw error;
// // //     }
// // //   };

// // //   const handleGetDirections = async () => {
// // //     if (!fromLocation || !toLocation) {
// // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // //       return;
// // //     }

// // //     setIsLoading(true);
// // //     setShowLoader(true);

// // //     try {
// // //       const { pickup, destination } = await fetchLocationCoordinates();

// // //       if (pickup && destination) {
// // //         const directions = await getDirections({
// // //           pickupCoordinates: pickup as [number, number],
// // //           destinationCoordinates: destination as [number, number],
// // //         });

// // //         setRouteCoordinates(directions);

// // //         const { distance, duration } = calculateDistanceAndDuration(pickup, destination);
// // //         setDistanceState(distance);
// // //         setDurationState(duration);

// // //         dispatch(setDistance(parseFloat(distance)));
// // //         dispatch(setDuration(parseFloat(duration)));

// // //         cameraRef.current?.flyTo({
// // //           center: [
// // //             (pickup[0] + destination[0]) / 2,
// // //             (pickup[1] + destination[1]) / 2,
// // //           ],
// // //           zoomLevel: 12,
// // //           duration: ANIMATION_DURATION,
// // //         });

// // //         handleSheetClose();
// // //       }
// // //     } catch (error) {
// // //       console.error('Direction Error:', error);
// // //     } finally {
// // //       setIsLoading(false);
// // //       setShowLoader(false);
// // //     }
// // //   };

// // //   const renderBackdrop = useCallback(
// // //     (props: any) => (
// // //       <BottomSheetBackdrop
// // //         appearsOnIndex={1}
// // //         disappearsOnIndex={0}
// // //         {...props}
// // //       />
// // //     ),
// // //     []
// // //   );

// // //   if (!accessToken) {
// // //     return (
// // //       <SafeAreaView style={styles.errorContainer}>
// // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // //         <Text style={styles.errorText}>Map access token is required</Text>
// // //       </SafeAreaView>
// // //     );
// // //   }

// // //   Mapbox.setAccessToken(accessToken);

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <StatusBar style="light" />

// // //       {showLoader && (
// // //         <Modal transparent animationType="fade">
// // //           <View style={styles.loaderContainer}>
// // //             <ActivityIndicator size="large" color="#FF9800" />
// // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // //           </View>
// // //         </Modal>
// // //       )}

// // //       <MapView
// // //         style={styles.map}
// // //         styleURL={MAP_STYLE}
// // //         zoomEnabled
// // //         rotateEnabled
// // //       >
// // //         <Camera
// // //           ref={cameraRef}
// // //           followUserLocation
// // //           followZoomLevel={INITIAL_ZOOM}
// // //           animationMode="flyTo"
// // //         />

// // //         <LocationPuck
// // //           visible
// // //           pulsing={{
// // //             isEnabled: true,
// // //             color: '#FF9800',
// // //             radius: 100,
// // //           }}
// // //         />

// // //         {pickupCoords && (
// // //           <ShapeSource
// // //             id="pickupPoint"
// // //             shape={{
// // //               type: 'Feature',
// // //               properties: {},
// // //               geometry: {
// // //                 type: 'Point',
// // //                 coordinates: pickupCoords,
// // //               },
// // //             }}
// // //           >
// // //             <SymbolLayer
// // //               id="pickupSymbol"
// // //               style={{
// // //                 iconImage: 'mapbox://markers/pickup-pin',
// // //                 iconSize: 1.5,
// // //                 iconOffset: [0, -15],
// // //               }}
// // //             />
// // //           </ShapeSource>
// // //         )}

// // //         {destinationCoords && (
// // //           <ShapeSource
// // //             id="destinationPoint"
// // //             shape={{
// // //               type: 'Feature',
// // //               properties: {},
// // //               geometry: {
// // //                 type: 'Point',
// // //                 coordinates: destinationCoords,
// // //               },
// // //             }}
// // //           >
// // //             <SymbolLayer
// // //               id="destinationSymbol"
// // //               style={{
// // //                 iconImage: 'mapbox://markers/destination-pin',
// // //                 iconSize: 1.5,
// // //                 iconOffset: [0, -15],
// // //               }}
// // //             />
// // //           </ShapeSource>
// // //         )}

// // //         {routeCoordinates && (
// // //           <ShapeSource
// // //             id="routeLine"
// // //             lineMetrics
// // //             shape={{
// // //               type: 'Feature',
// // //               properties: {},
// // //               geometry: {
// // //                 type: 'LineString',
// // //                 coordinates: routeCoordinates,
// // //               },
// // //             }}
// // //           >
// // //             <LineLayer
// // //               id="routeLine"
// // //               style={{
// // //                 lineWidth: 4,
// // //                 lineColor: '#FF9800',
// // //                 lineGradient: [
// // //                   'interpolate',
// // //                   ['linear'],
// // //                   ['line-progress'],
// // //                   0,
// // //                   '#FF9800',
// // //                   1,
// // //                   '#4CAF50',
// // //                 ],
// // //               }}
// // //             />
// // //           </ShapeSource>
// // //         )}
// // //       </MapView>

// // //       <View style={styles.actionContainer}>
// // //         <TouchableOpacity style={styles.locationButton} onPress={handleSheetOpen}>
// // //           <MaterialIcons name="location-on" size={24} color="white" />
// // //           <Text style={styles.buttonText}>Enter Location</Text>
// // //         </TouchableOpacity>

// // //         {distance && (
// // //           <TouchableOpacity
// // //             style={styles.continueButton}
// // //             onPress={() => router.push('/(authenticated)/(tabs)/vehicles')}
// // //           >
// // //             <Text style={styles.buttonText}>Continue</Text>
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>

// // //       {distance && duration && (
// // //         <View style={styles.infoBox}>
// // //           <Text style={styles.infoText}>Distance: {distance}</Text>
// // //           <Text style={styles.infoText}>Duration: {duration}</Text>
// // //         </View>
// // //       )}

// // //       <BottomSheet
// // //         ref={bottomSheetRef}
// // //         index={-1}
// // //         snapPoints={snapPoints}
// // //         backdropComponent={renderBackdrop}
// // //         enablePanDownToClose
// // //       >
// // //         <View style={styles.sheetContent}>
// // //           <Text style={styles.inputLabel}>From</Text>
// // //           <BottomSheetTextInput
// // //             value={fromLocation}
// // //             onChangeText={setFromLocation}
// // //             style={styles.input}
// // //             placeholder="Pickup Location"
// // //             placeholderTextColor="#B0BEC5"
// // //           />
// // //           <Text style={styles.inputLabel}>To</Text>
// // //           <BottomSheetTextInput
// // //             value={toLocation}
// // //             onChangeText={setToLocation}
// // //             style={styles.input}
// // //             placeholder="Destination Location"
// // //             placeholderTextColor="#B0BEC5"
// // //           />
// // //         </View>
// // //         <TouchableOpacity
// // //           style={styles.directionButton}
// // //           onPress={handleGetDirections}
// // //         >
// // //           {isLoading ? (
// // //             <ActivityIndicator size="small" color="white" />
// // //           ) : (
// // //             <Text style={styles.buttonText}>Get Directions</Text>
// // //           )}
// // //         </TouchableOpacity>
// // //       </BottomSheet>
// // //     </SafeAreaView>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#263238',
// // //   },
// // //   map: {
// // //     width: '100%',
// // //     height: '100%',
// // //   },
// // //   actionContainer: {
// // //     position: 'absolute',
// // //     bottom: 20,
// // //     left: 20,
// // //     right: 20,
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //   },
// // //   locationButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     // backgroundColor: '#FF9800',
// // //     backgroundColor: '#17db58',

// // //     padding: 10,
// // //     borderRadius: 8,
// // //   },
// // //   continueButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FF9800',
// // //     padding: 15,
// // //     borderRadius: 8,
// // //   },
// // //   buttonText: {
// // //     color: '#FFFFFF',
// // //     fontSize: 16,
// // //     marginLeft: 8,
// // //   },
// // //   sheetContent: {
// // //     padding: 16,
// // //     backgroundColor: '#37474F',
// // //     borderTopLeftRadius: 16,
// // //     borderTopRightRadius: 16,
// // //     flex: 1,
// // //   },
// // //   inputLabel: {
// // //     color: '#FF9800',
// // //     fontSize: 14,
// // //     marginBottom: 8,
// // //   },
// // //   input: {
// // //     padding: 10,
// // //     backgroundColor: '#546E7A',
// // //     borderRadius: 8,
// // //     color: '#FFFFFF',
// // //     marginBottom: 16,
// // //   },
// // //   directionButton: {
// // //     backgroundColor: '#FF9800',
// // //     padding: 12,
// // //     borderRadius: 8,
// // //     alignItems: 'center',
// // //     position: 'absolute',
// // //     bottom: 0,
// // //     left: 0,
// // //     right: 0,
// // //   },
// // //   loaderContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
// // //   },
// // //   loaderText: {
// // //     color: '#FF9800',
// // //     fontSize: 18,
// // //     marginTop: 10,
// // //   },
// // //   errorContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     padding: 16,
// // //   },
// // //   errorText: {
// // //     color: 'red',
// // //     fontSize: 18,
// // //     textAlign: 'center',
// // //     marginTop: 16,
// // //   },
// // //   infoBox: {
// // //     position: 'absolute',
// // //     bottom: 100,
// // //     left: 20,
// // //     right: 20,
// // //     padding: 10,
// // //     backgroundColor: '#546E7A',
// // //     borderRadius: 8,
// // //   },
// // //   infoText: {
// // //     color: '#FFFFFF',
// // //     fontSize: 14,
// // //   },
// // // });

// // // export default MapScreen;


// // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // import {
// // // //   StyleSheet,
// // // //   Text,
// // // //   TouchableOpacity,
// // // //   View,
// // // //   Alert,
// // // //   ActivityIndicator,
// // // //   Modal,
// // // //   Dimensions,
// // // //   Keyboard,
// // // // } from 'react-native';
// // // // import { StatusBar } from 'expo-status-bar';
// // // // import Mapbox, {
// // // //   Camera,
// // // //   LineLayer,
// // // //   LocationPuck,
// // // //   MapView,
// // // //   ShapeSource,
// // // //   SymbolLayer,
// // // // } from '@rnmapbox/maps';
// // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // import BottomSheet, {
// // // //   BottomSheetBackdrop,
// // // //   BottomSheetTextInput,
// // // // } from '@gorhom/bottom-sheet';
// // // // import { geoCoding } from '@/services/geoCoding';
// // // // import { getDirections } from '@/services/directions';
// // // // import { useRouter } from 'expo-router';
// // // // import { useDispatch } from 'react-redux';
// // // // import { setOrigin, setDestination, setDistance, setDuration } from '@/app/context/slices/navSlice';
// // // // import { MaterialIcons } from '@expo/vector-icons';

// // // // const { width, height } = Dimensions.get('window');
// // // // const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';
// // // // const INITIAL_ZOOM = 14;
// // // // const ANIMATION_DURATION = 2000;
// // // // const AVERAGE_SPEED_KMH = 60; // Assumed average speed in km/h

// // // // const MapScreen = () => {
// // // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // //   const [fromLocation, setFromLocation] = useState('');
// // // //   const [toLocation, setToLocation] = useState('');
// // // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // // //   const [distance, setDistanceState] = useState<string | null>(null);
// // // //   const [duration, setDurationState] = useState<string | null>(null);
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [showLoader, setShowLoader] = useState(false);

// // // //   const router = useRouter();
// // // //   const dispatch = useDispatch();
// // // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // // //   const cameraRef = useRef<Camera>(null);

// // // //   const snapPoints = ['30%', '50%', '80%'];

// // // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(1);
// // // //   const handleSheetClose = () => {
// // // //     Keyboard.dismiss();
// // // //     bottomSheetRef.current?.close();
// // // //   };

// // // //   const convertDurationToHoursMinutes = (durationHours: number): string => {
// // // //     const hours = Math.floor(durationHours);
// // // //     const minutes = Math.round((durationHours - hours) * 60);
// // // //     return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
// // // //   };

// // // //   const calculateDistanceAndDuration = (start: number[], end: number[]): { distance: string, duration: string } => {
// // // //     if (!start || !end) return { distance: 'N/A', duration: 'N/A' };

// // // //     const R = 6371e3; // Earth's radius in meters
// // // //     const φ1 = (start[1] * Math.PI) / 180;
// // // //     const φ2 = (end[1] * Math.PI) / 180;
// // // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // // //     const a =
// // // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // //     const distanceKm = (R * c) / 1000; // Convert to kilometers
// // // //     const durationHrs = distanceKm / AVERAGE_SPEED_KMH; // Duration in hours
// // // //     const formattedDuration = convertDurationToHoursMinutes(durationHrs);

// // // //     return { 
// // // //       distance: `${distanceKm.toFixed(2)} km`, 
// // // //       duration: formattedDuration
// // // //     };
// // // //   };

// // // //   const fetchLocationCoordinates = async () => {
// // // //     try {
// // // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // // //       setPickupCoords(pickup);
// // // //       setDestinationCoords(destination);

// // // //       if (pickup) dispatch(setOrigin({ latitude: pickup[1], longitude: pickup[0], address: fromLocation }));
// // // //       if (destination) dispatch(setDestination({ latitude: destination[1], longitude: destination[0], address: toLocation }));

// // // //       return { pickup, destination };
// // // //     } catch (error: any) {
// // // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // // //       throw error;
// // // //     }
// // // //   };

// // // //   const handleGetDirections = async () => {
// // // //     if (!fromLocation || !toLocation) {
// // // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // // //       return;
// // // //     }

// // // //     setIsLoading(true);
// // // //     setShowLoader(true);

// // // //     try {
// // // //       const { pickup, destination } = await fetchLocationCoordinates();

// // // //       if (pickup && destination) {
// // // //         const directions = await getDirections({
// // // //           pickupCoordinates: pickup as [number, number],
// // // //           destinationCoordinates: destination as [number, number],
// // // //         });

// // // //         setRouteCoordinates(directions);

// // // //         const { distance, duration } = calculateDistanceAndDuration(pickup, destination);
// // // //         setDistanceState(distance);
// // // //         setDurationState(duration);

// // // //         dispatch(setDistance(parseFloat(distance)));
// // // //         dispatch(setDuration(parseFloat(duration)));

// // // //         cameraRef.current?.flyTo({
// // // //           center: [
// // // //             (pickup[0] + destination[0]) / 2,
// // // //             (pickup[1] + destination[1]) / 2,
// // // //           ],
// // // //           zoomLevel: 12,
// // // //           duration: ANIMATION_DURATION,
// // // //         });

// // // //         handleSheetClose();
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Direction Error:', error);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //       setShowLoader(false);
// // // //     }
// // // //   };

// // // //   const renderBackdrop = useCallback(
// // // //     (props: any) => (
// // // //       <BottomSheetBackdrop
// // // //         appearsOnIndex={1}
// // // //         disappearsOnIndex={0}
// // // //         {...props}
// // // //       />
// // // //     ),
// // // //     []
// // // //   );

// // // //   if (!accessToken) {
// // // //     return (
// // // //       <SafeAreaView style={styles.errorContainer}>
// // // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // // //         <Text style={styles.errorText}>Map access token is required</Text>
// // // //       </SafeAreaView>
// // // //     );
// // // //   }

// // // //   Mapbox.setAccessToken(accessToken);

// // // //   return (
// // // //     <SafeAreaView style={styles.container}>
// // // //       <StatusBar style="light" />

// // // //       {showLoader && (
// // // //         <Modal transparent animationType="fade">
// // // //           <View style={styles.loaderContainer}>
// // // //             <ActivityIndicator size="large" color="#FF9800" />
// // // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // // //           </View>
// // // //         </Modal>
// // // //       )}

// // // //       <MapView
// // // //         style={styles.map}
// // // //         styleURL={MAP_STYLE}
// // // //         zoomEnabled
// // // //         rotateEnabled
// // // //       >
// // // //         <Camera
// // // //           ref={cameraRef}
// // // //           followUserLocation
// // // //           followZoomLevel={INITIAL_ZOOM}
// // // //           animationMode="flyTo"
// // // //         />

// // // //         <LocationPuck
// // // //           visible
// // // //           pulsing={{
// // // //             isEnabled: true,
// // // //             color: '#FF9800',
// // // //             radius: 100,
// // // //           }}
// // // //         />

// // // //         {pickupCoords && (
// // // //           <ShapeSource
// // // //             id="pickupPoint"
// // // //             shape={{
// // // //               type: 'Feature',
// // // //               properties: {},
// // // //               geometry: {
// // // //                 type: 'Point',
// // // //                 coordinates: pickupCoords,
// // // //               },
// // // //             }}
// // // //           >
// // // //             <SymbolLayer
// // // //               id="pickupSymbol"
// // // //               style={{
// // // //                 iconImage: 'mapbox://markers/pickup-pin',
// // // //                 iconSize: 1.5,
// // // //                 iconOffset: [0, -15],
// // // //               }}
// // // //             />
// // // //           </ShapeSource>
// // // //         )}

// // // //         {destinationCoords && (
// // // //           <ShapeSource
// // // //             id="destinationPoint"
// // // //             shape={{
// // // //               type: 'Feature',
// // // //               properties: {},
// // // //               geometry: {
// // // //                 type: 'Point',
// // // //                 coordinates: destinationCoords,
// // // //               },
// // // //             }}
// // // //           >
// // // //             <SymbolLayer
// // // //               id="destinationSymbol"
// // // //               style={{
// // // //                 iconImage: 'mapbox://markers/destination-pin',
// // // //                 iconSize: 1.5,
// // // //                 iconOffset: [0, -15],
// // // //               }}
// // // //             />
// // // //           </ShapeSource>
// // // //         )}

// // // //         {routeCoordinates && (
// // // //           <ShapeSource
// // // //             id="routeLine"
// // // //             lineMetrics
// // // //             shape={{
// // // //               type: 'Feature',
// // // //               properties: {},
// // // //               geometry: {
// // // //                 type: 'LineString',
// // // //                 coordinates: routeCoordinates,
// // // //               },
// // // //             }}
// // // //           >
// // // //             <LineLayer
// // // //               id="routeLine"
// // // //               style={{
// // // //                 lineWidth: 4,
// // // //                 lineColor: '#FF9800',
// // // //                 lineGradient: [
// // // //                   'interpolate',
// // // //                   ['linear'],
// // // //                   ['line-progress'],
// // // //                   0,
// // // //                   '#FF9800',
// // // //                   1,
// // // //                   '#4CAF50',
// // // //                 ],
// // // //               }}
// // // //             />
// // // //           </ShapeSource>
// // // //         )}
// // // //       </MapView>

// // // //       <View style={styles.actionContainer}>
// // // //         <TouchableOpacity style={styles.locationButton} onPress={handleSheetOpen}>
// // // //           <MaterialIcons name="location-on" size={24} color="white" />
// // // //           <Text style={styles.buttonText}>Enter Location</Text>
// // // //         </TouchableOpacity>

// // // //         {distance && (
// // // //           <TouchableOpacity
// // // //             style={styles.continueButton}
// // // //             onPress={() => router.push('/destination')}
// // // //           >
// // // //             <Text style={styles.buttonText}>Continue</Text>
// // // //           </TouchableOpacity>
// // // //         )}
// // // //       </View>

// // // //       {distance && duration && (
// // // //         <View style={styles.infoBox}>
// // // //           <Text style={styles.infoText}>Distance: {distance}</Text>
// // // //           <Text style={styles.infoText}>Duration: {duration}</Text>
// // // //         </View>
// // // //       )}

// // // //       <BottomSheet
// // // //         ref={bottomSheetRef}
// // // //         index={-1}
// // // //         snapPoints={snapPoints}
// // // //         backdropComponent={renderBackdrop}
// // // //         enablePanDownToClose
// // // //       >
// // // //         <View style={styles.sheetContent}>
// // // //           <Text style={styles.inputLabel}>From</Text>
// // // //           <BottomSheetTextInput
// // // //             value={fromLocation}
// // // //             onChangeText={setFromLocation}
// // // //             style={styles.input}
// // // //             placeholder="Pickup Location"
// // // //             placeholderTextColor="#B0BEC5"
// // // //           />
// // // //           <Text style={styles.inputLabel}>To</Text>
// // // //           <BottomSheetTextInput
// // // //             value={toLocation}
// // // //             onChangeText={setToLocation}
// // // //             style={styles.input}
// // // //             placeholder="Destination Location"
// // // //             placeholderTextColor="#B0BEC5"
// // // //           />
// // // //         </View>
// // // //         <TouchableOpacity
// // // //           style={styles.directionButton}
// // // //           onPress={handleGetDirections}
// // // //         >
// // // //           {isLoading ? (
// // // //             <ActivityIndicator size="small" color="white" />
// // // //           ) : (
// // // //             <Text style={styles.buttonText}>Get Directions</Text>
// // // //           )}
// // // //         </TouchableOpacity>
// // // //       </BottomSheet>
// // // //     </SafeAreaView>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: '#263238',
// // // //   },
// // // //   map: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   actionContainer: {
// // // //     position: 'absolute',
// // // //     bottom: 20,
// // // //     left: 20,
// // // //     right: 20,
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //   },
// // // //   locationButton: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#FF9800',
// // // //     padding: 10,
// // // //     borderRadius: 8,
// // // //   },
// // // //   continueButton: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#4CAF50',
// // // //     padding: 10,
// // // //     borderRadius: 8,
// // // //   },
// // // //   buttonText: {
// // // //     color: '#FFFFFF',
// // // //     fontSize: 16,
// // // //     marginLeft: 8,
// // // //   },
// // // //   sheetContent: {
// // // //     padding: 16,
// // // //     backgroundColor: '#37474F',
// // // //     borderTopLeftRadius: 16,
// // // //     borderTopRightRadius: 16,
// // // //     flex: 1,
// // // //   },
// // // //   inputLabel: {
// // // //     color: '#FF9800',
// // // //     fontSize: 14,
// // // //     marginBottom: 8,
// // // //   },
// // // //   input: {
// // // //     padding: 10,
// // // //     backgroundColor: '#546E7A',
// // // //     borderRadius: 8,
// // // //     color: '#FFFFFF',
// // // //     marginBottom: 16,
// // // //   },
// // // //   directionButton: {
// // // //     backgroundColor: '#FF9800',
// // // //     padding: 12,
// // // //     borderRadius: 8,
// // // //     alignItems: 'center',
// // // //     position: 'absolute',
// // // //     bottom: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //   },
// // // //   loaderContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.6)',
// // // //   },
// // // //   loaderText: {
// // // //     color: '#FF9800',
// // // //     fontSize: 18,
// // // //     marginTop: 10,
// // // //   },
// // // //   errorContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     padding: 16,
// // // //   },
// // // //   errorText: {
// // // //     color: 'red',
// // // //     fontSize: 18,
// // // //     textAlign: 'center',
// // // //     marginTop: 16,
// // // //   },
// // // //   infoBox: {
// // // //     position: 'absolute',
// // // //     bottom: 100,
// // // //     left: 20,
// // // //     right: 20,
// // // //     padding: 10,
// // // //     backgroundColor: '#546E7A',
// // // //     borderRadius: 8,
// // // //   },
// // // //   infoText: {
// // // //     color: '#FFFFFF',
// // // //     fontSize: 14,
// // // //   },
// // // // });

// // // // export default MapScreen;




// // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // import {
// // // // //   StyleSheet,
// // // // //   Text,
// // // // //   TouchableOpacity,
// // // // //   View,
// // // // //   Alert,
// // // // //   ActivityIndicator,
// // // // //   Modal,
// // // // //   Dimensions,
// // // // //   Keyboard,
// // // // // } from 'react-native';
// // // // // import { StatusBar } from 'expo-status-bar';
// // // // // import Mapbox, {
// // // // //   Camera,
// // // // //   LineLayer,
// // // // //   LocationPuck,
// // // // //   MapView,
// // // // //   ShapeSource,
// // // // //   SymbolLayer,
// // // // // } from '@rnmapbox/maps';
// // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // import BottomSheet, {
// // // // //   BottomSheetBackdrop,
// // // // //   BottomSheetTextInput,
// // // // // } from '@gorhom/bottom-sheet';
// // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // import { getDirections } from '@/services/directions';
// // // // // import { useRouter } from 'expo-router';
// // // // // import { useDispatch } from 'react-redux';
// // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';
// // // // // import { MaterialIcons } from '@expo/vector-icons';

// // // // // const { width, height } = Dimensions.get('window');

// // // // // const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';
// // // // // const INITIAL_ZOOM = 14;
// // // // // const ANIMATION_DURATION = 2000;

// // // // // const MapScreen = () => {
// // // // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // //   const [fromLocation, setFromLocation] = useState('');
// // // // //   const [toLocation, setToLocation] = useState('');
// // // // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // // // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // // // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // // // //   const [distance, setDistance] = useState<string | null>(null);
// // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // //   const [showLoader, setShowLoader] = useState(false);

// // // // //   const router = useRouter();
// // // // //   const dispatch = useDispatch();
// // // // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // // // //   const cameraRef = useRef<Camera>(null);

// // // // //   const snapPoints = ['30%', '40%','50%', '80%'];

// // // // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(1);
// // // // //   const handleSheetClose = () => {
// // // // //     Keyboard.dismiss();
// // // // //     bottomSheetRef.current?.close();
// // // // //   };

// // // // //   const calculateDistance = (start: number[], end: number[]): string => {
// // // // //     if (!start || !end) return 'N/A';

// // // // //     const R = 6371e3; // Earth's radius in meters
// // // // //     const φ1 = (start[1] * Math.PI) / 180;
// // // // //     const φ2 = (end[1] * Math.PI) / 180;
// // // // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // // // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // // // //     const a =
// // // // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // // // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // // //     const distance = (R * c) / 1000; // Convert to kilometers
// // // // //     return `${distance.toFixed(2)} km`;
// // // // //   };

// // // // //   const fetchLocationCoordinates = async () => {
// // // // //     try {
// // // // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // // // //       setPickupCoords(pickup);
// // // // //       setDestinationCoords(destination);

// // // // //       if (pickup) dispatch(setOrigin(pickup));
// // // // //       if (destination) dispatch(setDestination(destination));

// // // // //       return { pickup, destination };
// // // // //     } catch (error: any) {
// // // // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // // // //       throw error;
// // // // //     }
// // // // //   };

// // // // //   const handleGetDirections = async () => {
// // // // //     if (!fromLocation || !toLocation) {
// // // // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // // // //       return;
// // // // //     }

// // // // //     setIsLoading(true);
// // // // //     setShowLoader(true);

// // // // //     try {
// // // // //       const { pickup, destination } = await fetchLocationCoordinates();

// // // // //       if (pickup && destination) {
// // // // //         const directions = await getDirections({
// // // // //           pickupCoordinates: pickup as [number, number],
// // // // //           destinationCoordinates: destination as [number, number],
// // // // //         });

// // // // //         setRouteCoordinates(directions);
// // // // //         setDistance(calculateDistance(pickup, destination));

// // // // //         cameraRef.current?.flyTo({
// // // // //           center: [
// // // // //             (pickup[0] + destination[0]) / 2,
// // // // //             (pickup[1] + destination[1]) / 2,
// // // // //           ],
// // // // //           zoomLevel: 12,
// // // // //           duration: ANIMATION_DURATION,
// // // // //         });

// // // // //         handleSheetClose();
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error('Direction Error:', error);
// // // // //     } finally {
// // // // //       setIsLoading(false);
// // // // //       setShowLoader(false);
// // // // //     }
// // // // //   };

// // // // //   const renderBackdrop = useCallback(
// // // // //     (props: any) => (
// // // // //       <BottomSheetBackdrop
// // // // //         appearsOnIndex={1}
// // // // //         disappearsOnIndex={0}
// // // // //         {...props}
// // // // //       />
// // // // //     ),
// // // // //     []
// // // // //   );

// // // // //   if (!accessToken) {
// // // // //     return (
// // // // //       <SafeAreaView style={styles.errorContainer}>
// // // // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // // // //         <Text style={styles.errorText}>Map access token is required</Text>
// // // // //       </SafeAreaView>
// // // // //     );
// // // // //   }

// // // // //   Mapbox.setAccessToken(accessToken);

// // // // //   return (
// // // // //     <SafeAreaView style={styles.container}>
// // // // //       <StatusBar style="light" />

// // // // //       {showLoader && (
// // // // //         <Modal transparent animationType="fade">
// // // // //           <View style={styles.loaderContainer}>
// // // // //             <ActivityIndicator size="large" color="#FF9800" />
// // // // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // // // //           </View>
// // // // //         </Modal>
// // // // //       )}

// // // // //       <MapView
// // // // //         style={styles.map}
// // // // //         styleURL={MAP_STYLE}
// // // // //         zoomEnabled
// // // // //         rotateEnabled
// // // // //       >
// // // // //         <Camera
// // // // //           ref={cameraRef}
// // // // //           followUserLocation
// // // // //           followZoomLevel={INITIAL_ZOOM}
// // // // //           animationMode="flyTo"
// // // // //         />

// // // // //         <LocationPuck
// // // // //           visible
// // // // //           pulsing={{
// // // // //             isEnabled: true,
// // // // //             color: '#FF9800',
// // // // //             radius: 100,
// // // // //           }}
// // // // //         />

// // // // //         {pickupCoords && (
// // // // //           <ShapeSource
// // // // //             id="pickupPoint"
// // // // //             shape={{
// // // // //               type: 'Feature',
// // // // //               properties: {},
// // // // //               geometry: {
// // // // //                 type: 'Point',
// // // // //                 coordinates: pickupCoords,
// // // // //               },
// // // // //             }}
// // // // //           >
// // // // //             <SymbolLayer
// // // // //               id="pickupSymbol"
// // // // //               style={{
// // // // //                 iconImage: 'mapbox://markers/pickup-pin',
// // // // //                 iconSize: 1.5,
// // // // //                 iconOffset: [0, -15],
// // // // //               }}
// // // // //             />
// // // // //           </ShapeSource>
// // // // //         )}

// // // // //         {destinationCoords && (
// // // // //           <ShapeSource
// // // // //             id="destinationPoint"
// // // // //             shape={{
// // // // //               type: 'Feature',
// // // // //               properties: {},
// // // // //               geometry: {
// // // // //                 type: 'Point',
// // // // //                 coordinates: destinationCoords,
// // // // //               },
// // // // //             }}
// // // // //           >
// // // // //             <SymbolLayer
// // // // //               id="destinationSymbol"
// // // // //               style={{
// // // // //                 iconImage: 'mapbox://markers/destination-pin',
// // // // //                 iconSize: 1.5,
// // // // //                 iconOffset: [0, -15],
// // // // //               }}
// // // // //             />
// // // // //           </ShapeSource>
// // // // //         )}

// // // // //         {routeCoordinates && (
// // // // //           <ShapeSource
// // // // //             id="routeLine"
// // // // //             lineMetrics
// // // // //             shape={{
// // // // //               type: 'Feature',
// // // // //               properties: {},
// // // // //               geometry: {
// // // // //                 type: 'LineString',
// // // // //                 coordinates: routeCoordinates,
// // // // //               },
// // // // //             }}
// // // // //           >
// // // // //             <LineLayer
// // // // //               id="routePath"
// // // // //               style={{
// // // // //                 lineColor: '#FF9800',
// // // // //                 lineCap: 'round',
// // // // //                 lineJoin: 'round',
// // // // //                 lineWidth: 4,
// // // // //                 lineGradient: [
// // // // //                   'interpolate',
// // // // //                   ['linear'],
// // // // //                   ['line-progress'],
// // // // //                   0,
// // // // //                   '#4CAF50',
// // // // //                   1,
// // // // //                   '#FF9800',
// // // // //                 ],
// // // // //               }}
// // // // //             />
// // // // //           </ShapeSource>
// // // // //         )}
// // // // //       </MapView>

// // // // //       <View style={styles.actionContainer}>
// // // // //         <TouchableOpacity
// // // // //           style={styles.locationButton}
// // // // //           onPress={handleSheetOpen}
// // // // //         >
// // // // //           <MaterialIcons name="add-location" size={24} color="white" />
// // // // //           <Text style={styles.buttonText}>Set Location</Text>
// // // // //         </TouchableOpacity>

// // // // //         {distance && (
// // // // //           <TouchableOpacity
// // // // //             style={styles.continueButton}
// // // // //             onPress={() => router.push('/vehicles')}
// // // // //           >
// // // // //             <MaterialIcons name="directions-car" size={24} color="white" />
// // // // //             <Text style={styles.buttonText}>{distance}</Text>
// // // // //           </TouchableOpacity>
// // // // //         )}
// // // // //       </View>

// // // // //       <BottomSheet
// // // // //         ref={bottomSheetRef}
// // // // //         index={-1}
// // // // //         snapPoints={snapPoints}
// // // // //         enablePanDownToClose
// // // // //         backdropComponent={renderBackdrop}
// // // // //       >
// // // // //         <View style={styles.sheetContent}>
// // // // //           <BottomSheetTextInput
// // // // //             placeholder="Enter pickup location"
// // // // //             value={fromLocation}
// // // // //             onChangeText={setFromLocation}
// // // // //             style={styles.input}
// // // // //           />
// // // // //           <BottomSheetTextInput
// // // // //             placeholder="Enter destination location"
// // // // //             value={toLocation}
// // // // //             onChangeText={setToLocation}
// // // // //             style={styles.input}
// // // // //           />
// // // // //           <TouchableOpacity
// // // // //             style={styles.getDirectionsButton}
// // // // //             onPress={handleGetDirections}
// // // // //             disabled={isLoading}
// // // // //           >
// // // // //             {isLoading ? (
// // // // //               <ActivityIndicator size="small" color="white" />
// // // // //             ) : (
// // // // //               <Text style={styles.getDirectionsText}>Get Directions</Text>
// // // // //             )}
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </BottomSheet>
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //   container: {
// // // // //     flex: 1,
// // // // //     backgroundColor: '#1e1e1e',
// // // // //   },
// // // // //   map: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   loaderContainer: {
// // // // //     flex: 1,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // // //   },
// // // // //   loaderText: {
// // // // //     marginTop: 10,
// // // // //     color: '#FF9800',
// // // // //     fontSize: 16,
// // // // //   },
// // // // //   actionContainer: {
// // // // //     position: 'absolute',
// // // // //     bottom: 20,
// // // // //     width: width * 0.9,
// // // // //     alignSelf: 'center',
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //   },
// // // // //   locationButton: {
// // // // //     flex: 0.48,
// // // // //     backgroundColor: '#FF9800',
// // // // //     padding: 10,
// // // // //     borderRadius: 10,
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   continueButton: {
// // // // //     flex: 0.48,
// // // // //     backgroundColor: '#4CAF50',
// // // // //     padding: 10,
// // // // //     borderRadius: 10,
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   buttonText: {
// // // // //     marginLeft: 5,
// // // // //     color: 'white',
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   sheetContent: {
// // // // //     paddingHorizontal: 20,
// // // // //     paddingVertical: 15,
// // // // //   },
// // // // //   input: {
// // // // //     backgroundColor: '#f0f0f0',
// // // // //     padding: 10,
// // // // //     borderRadius: 10,
// // // // //     marginBottom: 15,
// // // // //   },
// // // // //   getDirectionsButton: {
// // // // //     backgroundColor: '#FF9800',
// // // // //     paddingVertical: 12,
// // // // //     borderRadius: 10,
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   getDirectionsText: {
// // // // //     color: 'white',
// // // // //     fontSize: 16,
// // // // //     fontWeight: 'bold',
// // // // //   },
// // // // //   errorContainer: {
// // // // //     flex: 1,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   errorText: {
// // // // //     marginTop: 10,
// // // // //     fontSize: 18,
// // // // //     color: 'red',
// // // // //   },
// // // // // });

// // // // // export default MapScreen;


// // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // import {
// // // // // //   StyleSheet,
// // // // // //   Text,
// // // // // //   TouchableOpacity,
// // // // // //   View,
// // // // // //   Alert,
// // // // // //   ActivityIndicator,
// // // // // //   Modal,
// // // // // //   Dimensions,
// // // // // //   Keyboard,
// // // // // // } from 'react-native';
// // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // import Mapbox, {
// // // // // //   Camera,
// // // // // //   LineLayer,
// // // // // //   LocationPuck,
// // // // // //   MapView,
// // // // // //   ShapeSource,
// // // // // //   SymbolLayer,
// // // // // // } from '@rnmapbox/maps';
// // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // import BottomSheet, {
// // // // // //   BottomSheetBackdrop,
// // // // // //   BottomSheetTextInput,
// // // // // // } from '@gorhom/bottom-sheet';
// // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // import { getDirections } from '@/services/directions';
// // // // // // import { useRouter } from 'expo-router';
// // // // // // import { useDispatch } from 'react-redux';
// // // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';
// // // // // // import { MaterialIcons } from '@expo/vector-icons';

// // // // // // const { width, height } = Dimensions.get('window');

// // // // // // const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';
// // // // // // const INITIAL_ZOOM = 14;
// // // // // // const ANIMATION_DURATION = 2000;

// // // // // // const MapScreen = () => {
// // // // // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // //   const [fromLocation, setFromLocation] = useState('');
// // // // // //   const [toLocation, setToLocation] = useState('');
// // // // // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // // // // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // // // // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // // // // //   const [distance, setDistance] = useState<string | null>(null);
// // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // //   const [showLoader, setShowLoader] = useState(false);

// // // // // //   const router = useRouter();
// // // // // //   const dispatch = useDispatch();
// // // // // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // //   const cameraRef = useRef<Camera>(null);
  
// // // // // //   const snapPoints = ['30%', '40%','50%', '80%'];

// // // // // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(1);
// // // // // //   const handleSheetClose = () => {
// // // // // //     Keyboard.dismiss();
// // // // // //     bottomSheetRef.current?.close();
// // // // // //   };

// // // // // //   const calculateDistance = (start: number[], end: number[]): string => {
// // // // // //     if (!start || !end) return 'N/A';

// // // // // //     const R = 6371e3; // Earth's radius in meters
// // // // // //     const φ1 = (start[1] * Math.PI) / 180;
// // // // // //     const φ2 = (end[1] * Math.PI) / 180;
// // // // // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // // // // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // // // // //     const a =
// // // // // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // // // // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // // // //     const distance = (R * c) / 1000; // Convert to kilometers
// // // // // //     return `${distance.toFixed(2)} km`;
// // // // // //   };

// // // // // //   const fetchLocationCoordinates = async () => {
// // // // // //     try {
// // // // // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // // // // //       setPickupCoords(pickup);
// // // // // //       setDestinationCoords(destination);

// // // // // //       if (pickup) dispatch(setOrigin(pickup));
// // // // // //       if (destination) dispatch(setDestination(destination));

// // // // // //       return { pickup, destination };
// // // // // //     } catch (error: any) {
// // // // // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // // // // //       throw error;
// // // // // //     }
// // // // // //   };

// // // // // //   const handleGetDirections = async () => {
// // // // // //     if (!fromLocation || !toLocation) {
// // // // // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // // // // //       return;
// // // // // //     }

// // // // // //     setIsLoading(true);
// // // // // //     setShowLoader(true);

// // // // // //     try {
// // // // // //       const { pickup, destination } = await fetchLocationCoordinates();
      
// // // // // //       if (pickup && destination) {
// // // // // //         const directions = await getDirections({
// // // // // //           pickupCoordinates: pickup as [number, number],
// // // // // //           destinationCoordinates: destination as [number, number],
// // // // // //         });

// // // // // //         setRouteCoordinates(directions);
// // // // // //         setDistance(calculateDistance(pickup, destination));

// // // // // //         // Animate camera to show the route
// // // // // //         cameraRef.current?.flyTo({
// // // // // //           center: [
// // // // // //             (pickup[0] + destination[0]) / 2,
// // // // // //             (pickup[1] + destination[1]) / 2,
// // // // // //           ],
// // // // // //           zoomLevel: 12,
// // // // // //           duration: ANIMATION_DURATION,
// // // // // //         });

// // // // // //         handleSheetClose();
// // // // // //       }
// // // // // //     } catch (error) {
// // // // // //       console.error('Direction Error:', error);
// // // // // //     } finally {
// // // // // //       setIsLoading(false);
// // // // // //       setShowLoader(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const renderBackdrop = useCallback(
// // // // // //     (props: any) => (
// // // // // //       <BottomSheetBackdrop
// // // // // //         appearsOnIndex={1}
// // // // // //         disappearsOnIndex={0}
// // // // // //         {...props}
// // // // // //       />
// // // // // //     ),
// // // // // //     []
// // // // // //   );

// // // // // //   if (!accessToken) {
// // // // // //     return (
// // // // // //       <SafeAreaView style={styles.errorContainer}>
// // // // // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // // // // //         <Text style={styles.errorText}>Map access token is required</Text>
// // // // // //       </SafeAreaView>
// // // // // //     );
// // // // // //   }

// // // // // //   Mapbox.setAccessToken(accessToken);

// // // // // //   return (
// // // // // //     <SafeAreaView style={styles.container}>
// // // // // //       <StatusBar style="light" />
      
// // // // // //       {showLoader && (
// // // // // //         <Modal transparent animationType="fade">
// // // // // //           <View style={styles.loaderContainer}>
// // // // // //             <ActivityIndicator size="large" color="#FF9800" />
// // // // // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // // // // //           </View>
// // // // // //         </Modal>
// // // // // //       )}

// // // // // //       <MapView
// // // // // //         style={styles.map}
// // // // // //         styleURL={MAP_STYLE}
// // // // // //         zoomEnabled
// // // // // //         rotateEnabled
// // // // // //       >
// // // // // //         <Camera
// // // // // //           ref={cameraRef}
// // // // // //           followUserLocation
// // // // // //           followZoomLevel={INITIAL_ZOOM}
// // // // // //           animationMode="flyTo"
// // // // // //         />

// // // // // //         <LocationPuck
// // // // // //           visible
// // // // // //           pulsing={{
// // // // // //             isEnabled: true,
// // // // // //             color: '#FF9800',
// // // // // //             radius: 100,
// // // // // //           }}
// // // // // //         />

// // // // // //         {pickupCoords && (
// // // // // //           <ShapeSource
// // // // // //             id="pickupPoint"
// // // // // //             shape={{
// // // // // //               type: 'Feature',
// // // // // //               properties: {},
// // // // // //               geometry: {
// // // // // //                 type: 'Point',
// // // // // //                 coordinates: pickupCoords,
// // // // // //               },
// // // // // //             }}
// // // // // //           >
// // // // // //             <SymbolLayer
// // // // // //               id="pickupSymbol"
// // // // // //               style={{
// // // // // //                 iconImage: 'mapbox://markers/pickup-pin',
// // // // // //                 iconSize: 1.5,
// // // // // //                 iconOffset: [0, -15],
// // // // // //               }}
// // // // // //             />
// // // // // //           </ShapeSource>
// // // // // //         )}

// // // // // //         {destinationCoords && (
// // // // // //           <ShapeSource
// // // // // //             id="destinationPoint"
// // // // // //             shape={{
// // // // // //               type: 'Feature',
// // // // // //               properties: {},
// // // // // //               geometry: {
// // // // // //                 type: 'Point',
// // // // // //                 coordinates: destinationCoords,
// // // // // //               },
// // // // // //             }}
// // // // // //           >
// // // // // //             <SymbolLayer
// // // // // //               id="destinationSymbol"
// // // // // //               style={{
// // // // // //                 iconImage: 'mapbox://markers/destination-pin',
// // // // // //                 iconSize: 1.5,
// // // // // //                 iconOffset: [0, -15],
// // // // // //               }}
// // // // // //             />
// // // // // //           </ShapeSource>
// // // // // //         )}

// // // // // //         {routeCoordinates && (
// // // // // //           <ShapeSource
// // // // // //             id="routeLine"
// // // // // //             lineMetrics
// // // // // //             shape={{
// // // // // //               type: 'Feature',
// // // // // //               properties: {},
// // // // // //               geometry: {
// // // // // //                 type: 'LineString',
// // // // // //                 coordinates: routeCoordinates,
// // // // // //               },
// // // // // //             }}
// // // // // //           >
// // // // // //             <LineLayer
// // // // // //               id="routePath"
// // // // // //               style={{
// // // // // //                 lineColor: '#FF9800',
// // // // // //                 lineCap: 'round',
// // // // // //                 lineJoin: 'round',
// // // // // //                 lineWidth: 4,
// // // // // //                 lineGradient: [
// // // // // //                   'interpolate',
// // // // // //                   ['linear'],
// // // // // //                   ['line-progress'],
// // // // // //                   0,
// // // // // //                   '#4CAF50',
// // // // // //                   1,
// // // // // //                   '#FF9800',
// // // // // //                 ],
// // // // // //               }}
// // // // // //             />
// // // // // //           </ShapeSource>
// // // // // //         )}
// // // // // //       </MapView>

// // // // // //       <View style={styles.actionContainer}>
// // // // // //         <TouchableOpacity
// // // // // //           style={styles.locationButton}
// // // // // //           onPress={handleSheetOpen}
// // // // // //         >
// // // // // //           <MaterialIcons name="add-location" size={24} color="white" />
// // // // // //           <Text style={styles.buttonText}>Set Location</Text>
// // // // // //         </TouchableOpacity>

// // // // // //         {distance && (
// // // // // //           <TouchableOpacity
// // // // // //             style={styles.continueButton}
// // // // // //             onPress={() => router.push('/vehicles')}
// // // // // //           >
// // // // // //             <MaterialIcons name="directions-car" size={24} color="white" />
// // // // // //             <Text style={styles.buttonText}>{distance}</Text>
// // // // // //           </TouchableOpacity>
// // // // // //         )}
// // // // // //       </View>

// // // // // //       <BottomSheet
// // // // // //         ref={bottomSheetRef}
// // // // // //         index={-1}
// // // // // //         snapPoints={snapPoints}
// // // // // //         enablePanDownToClose
// // // // // //         backdropComponent={renderBackdrop}
// // // // // //       >
// // // // // //         <View style={styles.sheetContent}>
// // // // // //  <BottomSheetTextInput
// // // // // //             placeholder="Enter pickup location"
// // // // // //             value={fromLocation}
// // // // // //             onChangeText={setFromLocation}
// // // // // //             style={styles.input}
// // // // // //           />
// // // // // //           <BottomSheetTextInput
// // // // // //             placeholder="Enter destination location"
// // // // // //             value={toLocation}
// // // // // //             onChangeText={setToLocation}
// // // // // //             style={styles.input}
// // // // // //           />
// // // // // //           <TouchableOpacity
// // // // // //             style={styles.getDirectionsButton}
// // // // // //             onPress={handleGetDirections}
// // // // // //             disabled={isLoading}
// // // // // //           >
// // // // // //             {isLoading ? (
// // // // // //               <ActivityIndicator size="small" color="white" />
// // // // // //             ) : (
// // // // // //               <Text style={styles.getDirectionsText}>Get Directions</Text>
// // // // // //             )}
// // // // // //           </TouchableOpacity>
// // // // // //         </View>
// // // // // //       </BottomSheet>
// // // // // //     </SafeAreaView>
// // // // // //   );
// // // // // // };

// // // // // // const styles = StyleSheet.create({
// // // // // //   container: {
// // // // // //     flex: 1,
// // // // // //     backgroundColor: '#1e1e1e',
// // // // // //   },
// // // // // //   map: {
// // // // // //     flex: 1,
// // // // // //   },
// // // // // //   loaderContainer: {
// // // // // //     flex: 1,
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // // // //   },
// // // // // //   loaderText: {
// // // // // //     marginTop: 10,
// // // // // //     color: '#FF9800',
// // // // // //     fontSize: 16,
// // // // // //   },
// // // // // //   actionContainer: {
// // // // // //     position: 'absolute',
// // // // // //     bottom: 20,
// // // // // //     width: width * 0.9,
// // // // // //     alignSelf: 'center',
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'space-between',
// // // // // //   },
// // // // // //   locationButton: {
// // // // // //     flex: 0.48,
// // // // // //     backgroundColor: '#FF9800',
// // // // // //     padding: 10,
// // // // // //     borderRadius: 10,
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   continueButton: {
// // // // // //     flex: 0.48,
// // // // // //     backgroundColor: '#4CAF50',
// // // // // //     padding: 10,
// // // // // //     borderRadius: 10,
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   buttonText: {
// // // // // //     marginLeft: 5,
// // // // // //     color: 'white',
// // // // // //     fontWeight: '600',
// // // // // //   },
// // // // // //   sheetContent: {
// // // // // //     paddingHorizontal: 20,
// // // // // //     paddingVertical: 15,
// // // // // //   },
// // // // // //   input: {
// // // // // //     backgroundColor: '#f0f0f0',
// // // // // //     padding: 10,
// // // // // //     borderRadius: 10,
// // // // // //     marginBottom: 15,
// // // // // //   },
// // // // // //   getDirectionsButton: {
// // // // // //     backgroundColor: '#FF9800',
// // // // // //     paddingVertical: 12,
// // // // // //     borderRadius: 10,
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   getDirectionsText: {
// // // // // //     color: 'white',
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: 'bold',
// // // // // //   },
// // // // // //   errorContainer: {
// // // // // //     flex: 1,
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   errorText: {
// // // // // //     marginTop: 10,
// // // // // //     fontSize: 18,
// // // // // //     color: 'red',
// // // // // //   },
// // // // // // });

// // // // // // export default MapScreen;



// // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // import {
// // // // // // //   StyleSheet,
// // // // // // //   Text,
// // // // // // //   TouchableOpacity,
// // // // // // //   View,
// // // // // // //   Alert,
// // // // // // //   ActivityIndicator,
// // // // // // //   Modal,
// // // // // // //   Dimensions,
// // // // // // //   Platform,
// // // // // // //   Keyboard,
// // // // // // // } from 'react-native';
// // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // import Mapbox, {
// // // // // // //   Camera,
// // // // // // //   LineLayer,
// // // // // // //   LocationPuck,
// // // // // // //   MapView,
// // // // // // //   ShapeSource,
// // // // // // //   SymbolLayer,
// // // // // // // } from '@rnmapbox/maps';
// // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // import BottomSheet, {
// // // // // // //   BottomSheetBackdrop,
// // // // // // //   BottomSheetTextInput,
// // // // // // // } from '@gorhom/bottom-sheet';
// // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // import { useRouter } from 'expo-router';
// // // // // // // import { useDispatch } from 'react-redux';
// // // // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';
// // // // // // // import { MaterialIcons } from '@expo/vector-icons';

// // // // // // // const { width, height } = Dimensions.get('window');

// // // // // // // const MAP_STYLE = 'mapbox://styles/mapbox/streets-v11';
// // // // // // // const INITIAL_ZOOM = 14;
// // // // // // // const ANIMATION_DURATION = 2000;

// // // // // // // interface Coordinates {
// // // // // // //   latitude: number;
// // // // // // //   longitude: number;
// // // // // // // }

// // // // // // // const MapScreen = () => {
// // // // // // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // //   const [fromLocation, setFromLocation] = useState('');
// // // // // // //   const [toLocation, setToLocation] = useState('');
// // // // // // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // // // // // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // // // // // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // // // // // //   const [distance, setDistance] = useState<string | null>(null);
// // // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // // //   const [showLoader, setShowLoader] = useState(false);

// // // // // // //   const router = useRouter();
// // // // // // //   const dispatch = useDispatch();
// // // // // // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // //   const cameraRef = useRef<Camera>(null);
  

// // // // // // //   const snapPoints = ['30%', '50%', '80%'];

// // // // // // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(1);
// // // // // // //   const handleSheetClose = () => {
// // // // // // //     Keyboard.dismiss();
// // // // // // //     bottomSheetRef.current?.close();
// // // // // // //   };

// // // // // // //   const calculateDistance = (start: number[], end: number[]): string => {
// // // // // // //     if (!start || !end) return 'N/A';

// // // // // // //     const R = 6371e3; // Earth's radius in meters
// // // // // // //     const φ1 = (start[1] * Math.PI) / 180;
// // // // // // //     const φ2 = (end[1] * Math.PI) / 180;
// // // // // // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // // // // // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // // // // // //     const a =
// // // // // // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // // // // // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // // // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // // // // //     const distance = (R * c) / 1000; // Convert to kilometers
// // // // // // //     return `${distance.toFixed(2)} km`;
// // // // // // //   };

// // // // // // //   const fetchLocationCoordinates = async () => {
// // // // // // //     try {
// // // // // // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // // // // // //       setPickupCoords(pickup);
// // // // // // //       setDestinationCoords(destination);

// // // // // // //       if (pickup) dispatch(setOrigin(pickup));
// // // // // // //       if (destination) dispatch(setDestination(destination));

// // // // // // //       return { pickup, destination };
// // // // // // //     } catch (error: any) {
// // // // // // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // // // // // //       throw error;
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleGetDirections = async () => {
// // // // // // //     if (!fromLocation || !toLocation) {
// // // // // // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     setIsLoading(true);
// // // // // // //     setShowLoader(true);

// // // // // // //     try {
// // // // // // //       const { pickup, destination } = await fetchLocationCoordinates();
      
// // // // // // //       if (pickup && destination) {
// // // // // // //         const directions = await getDirections({
// // // // // // //           pickupCoordinates: pickup as [number, number],
// // // // // // //           destinationCoordinates: destination as [number, number],
// // // // // // //         });

// // // // // // //         setRouteCoordinates(directions);
// // // // // // //         setDistance(calculateDistance(pickup, destination));

// // // // // // //         // Animate camera to show the route
// // // // // // //         cameraRef.current?.flyTo({
// // // // // // //           centerCoordinate: [
// // // // // // //             (pickup[0] + destination[0]) / 2,
// // // // // // //             (pickup[1] + destination[1]) / 2,
// // // // // // //           ],
// // // // // // //           zoomLevel: 12,
// // // // // // //           duration: ANIMATION_DURATION,
// // // // // // //         });

// // // // // // //         handleSheetClose();
// // // // // // //       }
// // // // // // //     } catch (error) {
// // // // // // //       console.error('Direction Error:', error);
// // // // // // //     } finally {
// // // // // // //       setIsLoading(false);
// // // // // // //       setShowLoader(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const renderBackdrop = useCallback(
// // // // // // //     (props: any) => (
// // // // // // //       <BottomSheetBackdrop
// // // // // // //         appearsOnIndex={1}
// // // // // // //         disappearsOnIndex={0}
// // // // // // //         {...props}
// // // // // // //       />
// // // // // // //     ),
// // // // // // //     []
// // // // // // //   );

// // // // // // //   if (!accessToken) {
// // // // // // //     return (
// // // // // // //       <SafeAreaView style={styles.errorContainer}>
// // // // // // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // // // // // //         <Text style={styles.errorText}>Map access token is required</Text>
// // // // // // //       </SafeAreaView>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   Mapbox.setAccessToken(accessToken);

// // // // // // //   return (
// // // // // // //     <SafeAreaView style={styles.container}>
// // // // // // //       <StatusBar style="light" />
      
// // // // // // //       {showLoader && (
// // // // // // //         <Modal transparent animationType="fade">
// // // // // // //           <View style={styles.loaderContainer}>
// // // // // // //             <ActivityIndicator size="large" color="#FF9800" />
// // // // // // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // // // // // //           </View>
// // // // // // //         </Modal>
// // // // // // //       )}

// // // // // // //       <MapView
// // // // // // //         style={styles.map}
// // // // // // //         styleURL={MAP_STYLE}
// // // // // // //         zoomEnabled
// // // // // // //         rotateEnabled
// // // // // // //       >
// // // // // // //         <Camera
// // // // // // //           ref={cameraRef}
// // // // // // //           followUserLocation
// // // // // // //           followZoomLevel={INITIAL_ZOOM}
// // // // // // //           animationMode="flyTo"
// // // // // // //         />

// // // // // // //         <LocationPuck
// // // // // // //           visible
// // // // // // //           pulsing={{
// // // // // // //             isEnabled: true,
// // // // // // //             color: '#FF9800',
// // // // // // //             radius: 100,
// // // // // // //           }}
// // // // // // //         />

// // // // // // //         {pickupCoords && (
// // // // // // //           <ShapeSource
// // // // // // //             id="pickupPoint"
// // // // // // //             shape={{
// // // // // // //               type: 'Feature',
// // // // // // //               properties: {},
// // // // // // //               geometry: {
// // // // // // //                 type: 'Point',
// // // // // // //                 coordinates: pickupCoords,
// // // // // // //               },
// // // // // // //             }}
// // // // // // //           >
// // // // // // //             <SymbolLayer
// // // // // // //               id="pickupSymbol"
// // // // // // //               style={{
// // // // // // //                 iconImage: 'mapbox://markers/pickup-pin',
// // // // // // //                 iconSize: 1.5,
// // // // // // //                 iconOffset: [0, -15],
// // // // // // //               }}
// // // // // // //             />
// // // // // // //           </ShapeSource>
// // // // // // //         )}

// // // // // // //         {destinationCoords && (
// // // // // // //           <ShapeSource
// // // // // // //             id="destinationPoint"
// // // // // // //             shape={{
// // // // // // //               type: 'Feature',
// // // // // // //               properties: {},
// // // // // // //               geometry: {
// // // // // // //                 type: 'Point',
// // // // // // //                 coordinates: destinationCoords,
// // // // // // //               },
// // // // // // //             }}
// // // // // // //           >
// // // // // // //             <SymbolLayer
// // // // // // //               id="destinationSymbol"
// // // // // // //               style={{
// // // // // // //                 iconImage: 'mapbox://markers/destination-pin',
// // // // // // //                 iconSize: 1.5,
// // // // // // //                 iconOffset: [0, -15],
// // // // // // //               }}
// // // // // // //             />
// // // // // // //           </ShapeSource>
// // // // // // //         )}

// // // // // // //         {routeCoordinates && (
// // // // // // //           <ShapeSource
// // // // // // //             id="routeLine"
// // // // // // //             lineMetrics
// // // // // // //             shape={{
// // // // // // //               type: 'Feature',
// // // // // // //               properties: {},
// // // // // // //               geometry: {
// // // // // // //                 type: 'LineString',
// // // // // // //                 coordinates: routeCoordinates,
// // // // // // //               },
// // // // // // //             }}
// // // // // // //           >
// // // // // // //             <LineLayer
// // // // // // //               id="routePath"
// // // // // // //               style={{
// // // // // // //                 lineColor: '#FF9800',
// // // // // // //                 lineCap: 'round',
// // // // // // //                 lineJoin: 'round',
// // // // // // //                 lineWidth: 4,
// // // // // // //                 lineGradient: [
// // // // // // //                   'interpolate',
// // // // // // //                   ['linear'],
// // // // // // //                   ['line-progress'],
// // // // // // //                   0,
// // // // // // //                   '#4CAF50',
// // // // // // //                   1,
// // // // // // //                   '#FF9800',
// // // // // // //                 ],
// // // // // // //               }}
// // // // // // //             />
// // // // // // //           </ShapeSource>
// // // // // // //         )}
// // // // // // //       </MapView>

// // // // // // //       <View style={styles.actionContainer}>
// // // // // // //         <TouchableOpacity
// // // // // // //           style={styles.locationButton}
// // // // // // //           onPress={handleSheetOpen}
// // // // // // //         >
// // // // // // //           <MaterialIcons name="add-location" size={24} color="white" />
// // // // // // //           <Text style={styles.buttonText}>Set Location</Text>
// // // // // // //         </TouchableOpacity>

// // // // // // //         {distance && (
// // // // // // //           <TouchableOpacity
// // // // // // //             style={styles.continueButton}
// // // // // // //             onPress={() => router.push('/vehicles')}
// // // // // // //           >
// // // // // // //             <MaterialIcons name="directions-car" size={24} color="white" />
// // // // // // //             <Text style={styles.buttonText}>{distance}</Text>
// // // // // // //           </TouchableOpacity>
// // // // // // //         )}
// // // // // // //       </View>

// // // // // // //       <BottomSheet
// // // // // // //         ref={bottomSheetRef}
// // // // // // //         index={-1}
// // // // // // //         snapPoints={snapPoints}
// // // // // // //         enablePanDownToClose
// // // // // // //         backdropComponent={renderBackdrop}
// // // // // // //       >
// // // // // // //         <View style={styles.sheetContent}>
// // // // // // //           <BottomSheetTextInput
// // // // // // //             placeholder="Enter pickup location"
// // // // // // //             value={fromLocation}
// // // // // // //             onChangeText={setFromLocation}
// // // // // // //             style={styles.input}
// // // // // // //           />
// // // // // // //           <BottomSheetTextInput
// // // // // // //             placeholder="Enter destination location"
// // // // // // //             value={toLocation}
// // // // // // //             onChangeText={setToLocation}
// // // // // // //             style={styles.input}
// // // // // // //           />
// // // // // // //           <TouchableOpacity
// // // // // // //             style={styles.getDirectionsButton}
// // // // // // //             onPress={handleGetDirections}
// // // // // // //             disabled={isLoading}
// // // // // // //           >
// // // // // // //             {isLoading ? (
// // // // // // //               <ActivityIndicator size="small" color="white" />
// // // // // // //             ) : (
// // // // // // //               <Text style={styles.getDirectionsText}>Get Directions</Text>
// // // // // // //             )}
// // // // // // //           </TouchableOpacity>
// // // // // // //         </View>
// // // // // // //       </BottomSheet>
// // // // // // //     </SafeAreaView>
// // // // // // //   );
// // // // // // // };

// // // // // // // const styles = StyleSheet.create({
// // // // // // //   container: {
// // // // // // //     flex: 1,
// // // // // // //     backgroundColor: '#1e1e1e',
// // // // // // //   },
// // // // // // //   map: {
// // // // // // //     flex: 1,
// // // // // // //   },
// // // // // // //   loaderContainer: {
// // // // // // //     flex: 1,
// // // // // // //     justifyContent: 'center',
// // // // // // //     alignItems: 'center',
// // // // // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // // // // //   },
// // // // // // //   loaderText: {
// // // // // // //     marginTop: 10,
// // // // // // //     color: '#FF9800',
// // // // // // //     fontSize: 16,
// // // // // // //   },
// // // // // // //   actionContainer: {
// // // // // // //     position: 'absolute',
// // // // // // //     bottom: 20,
// // // // // // //     width: width * 0.9,
// // // // // // //     alignSelf: 'center',
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'space-between',
// // // // // // //   },
// // // // // // //   locationButton: {
// // // // // // //     flex: 0.48,
// // // // // // //     backgroundColor: '#FF9800',
// // // // // // //     padding: 10,
// // // // // // //     borderRadius: 10,
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'center',
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   continueButton: {
// // // // // // //     flex: 0.48,
// // // // // // //     backgroundColor: '#4CAF50',
// // // // // // //     padding: 10,
// // // // // // //     borderRadius: 10,
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'center',
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   buttonText: {
// // // // // // //     marginLeft: 5,
// // // // // // //     color: 'white',
// // // // // // //     fontWeight: '600',
// // // // // // //   },
// // // // // // //   sheetContent: {
// // // // // // //     paddingHorizontal: 20,
// // // // // // //     paddingVertical: 15,
// // // // // // //   },
// // // // // // //   input: {
// // // // // // //     backgroundColor: '#f0f0f0',
// // // // // // //     padding: 10,
// // // // // // //     borderRadius: 10,
// // // // // // //     marginBottom: 15,
// // // // // // //   },
// // // // // // //   getDirectionsButton: {
// // // // // // //     backgroundColor: '#FF9800',
// // // // // // //     paddingVertical: 12,
// // // // // // //     borderRadius: 10,
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   getDirectionsText: {
// // // // // // //     color: 'white',
// // // // // // //     fontSize: 16,
// // // // // // //     fontWeight: 'bold',
// // // // // // //   },
// // // // // // //   errorContainer: {
// // // // // // //     flex: 1,
// // // // // // //     justifyContent: 'center',
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   errorText: {
// // // // // // //     marginTop: 10,
// // // // // // //     fontSize: 18,
// // // // // // //     color: 'red',
// // // // // // //   },
// // // // // // // });

// // // // // // // export default MapScreen;




// // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // import {
// // // // // // // //   StyleSheet,
// // // // // // // //   Text,
// // // // // // // //   TouchableOpacity,
// // // // // // // //   View,
// // // // // // // //   Alert,
// // // // // // // //   ActivityIndicator,
// // // // // // // //   Modal,
// // // // // // // //   Dimensions,
// // // // // // // //   Platform,
// // // // // // // // } from 'react-native';
// // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // import Mapbox, {
// // // // // // // //   Camera,
// // // // // // // //   LineLayer,
// // // // // // // //   LocationPuck,
// // // // // // // //   MapView,
// // // // // // // //   ShapeSource,
// // // // // // // //   SymbolLayer,
// // // // // // // // } from '@rnmapbox/maps';
// // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // import BottomSheet, {
// // // // // // // //   BottomSheetBackdrop,
// // // // // // // //   BottomSheetTextInput,
// // // // // // // // } from '@gorhom/bottom-sheet';
// // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // import { useDispatch } from 'react-redux';
// // // // // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';
// // // // // // // // import { MaterialIcons } from '@expo/vector-icons';

// // // // // // // // import { useSelector } from 'react-redux';
// // // // // // // // import { 
// // // // // // // //   setLocationNames, 
// // // // // // // //   setRouteCoordinates, 
// // // // // // // //   setDistance as setReduxDistance 
// // // // // // // // } from '@/app/context/slices/navSlice';
// // // // // // // // import { RootState } from '@/app/context/store'; // Adjust the path as needed



// // // // // // // // const { width, height } = Dimensions.get('window');
// // // // // // // // const MAP_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';
// // // // // // // // const INITIAL_ZOOM = 15;
// // // // // // // // const ANIMATION_DURATION = 2000;

// // // // // // // // interface Coordinates {
// // // // // // // //   latitude: number;
// // // // // // // //   longitude: number;
// // // // // // // // }

// // // // // // // // const MapScreen = () => {
// // // // // // // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // //   const [fromLocation, setFromLocation] = useState('');
// // // // // // // //   const [toLocation, setToLocation] = useState('');
// // // // // // // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // // // // // // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // // // // // // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // // // // // // //   const [distance, setDistance] = useState<string | null>(null);
// // // // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // // // //   const [showLoader, setShowLoader] = useState(false);

// // // // // // // //   const router = useRouter();
// // // // // // // //   const dispatch = useDispatch();
// // // // // // // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // //   const cameraRef = useRef<Camera>(null);

// // // // // // // //   const snapPoints = ['25%', '50%', '75%'];

// // // // // // // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(1);
// // // // // // // //   const handleSheetClose = () => bottomSheetRef.current?.close();

// // // // // // // //   const calculateDistance = (start: number[], end: number[]): string => {
// // // // // // // //     if (!start || !end) return 'N/A';
// // // // // // // //     const R = 6371e3; // Earth's radius in meters
// // // // // // // //     const φ1 = (start[1] * Math.PI) / 180;
// // // // // // // //     const φ2 = (end[1] * Math.PI) / 180;
// // // // // // // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // // // // // // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // // // // // // //     const a =
// // // // // // // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // // // // // // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // // // // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// // // // // // // //     const distance = (R * c) / 1000; // Convert to kilometers
// // // // // // // //     return `${distance.toFixed(2)} km`;
// // // // // // // //   };

// // // // // // // //   const fetchLocationCoordinates = async () => {
// // // // // // // //     try {
// // // // // // // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // // // // // // //       setPickupCoords(pickup);
// // // // // // // //       setDestinationCoords(destination);

// // // // // // // //       if (pickup) dispatch(setOrigin(pickup));
// // // // // // // //       if (destination) dispatch(setDestination(destination));

// // // // // // // //       return { pickup, destination };
// // // // // // // //     } catch (error: any) {
// // // // // // // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // // // // // // //       throw error;
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleGetDirections = async () => {
// // // // // // // //     if (!fromLocation || !toLocation) {
// // // // // // // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     setIsLoading(true);
// // // // // // // //     setShowLoader(true);

// // // // // // // //     try {
// // // // // // // //       const { pickup, destination } = await fetchLocationCoordinates();
// // // // // // // //       if (pickup && destination) {
// // // // // // // //         const directions = await getDirections({
// // // // // // // //           pickupCoordinates: pickup as [number, number],
// // // // // // // //           destinationCoordinates: destination as [number, number],
// // // // // // // //         });

// // // // // // // //         setRouteCoordinates(directions);
// // // // // // // //         setDistance(calculateDistance(pickup, destination));

// // // // // // // //         cameraRef.current?.flyTo({
// // // // // // // //           center: [
// // // // // // // //             (pickup[0] + destination[0]) / 2,
// // // // // // // //             (pickup[1] + destination[1]) / 2,
// // // // // // // //           ],
// // // // // // // //           zoomLevel: 12,
// // // // // // // //           duration: ANIMATION_DURATION,
// // // // // // // //         });

// // // // // // // //         handleSheetClose();
// // // // // // // //       }
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error('Direction Error:', error);
// // // // // // // //     } finally {
// // // // // // // //       setIsLoading(false);
// // // // // // // //       setShowLoader(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const renderBackdrop = useCallback(
// // // // // // // //     (props: any) => (
// // // // // // // //       <BottomSheetBackdrop
// // // // // // // //         appearsOnIndex={1}
// // // // // // // //         disappearsOnIndex={0}
// // // // // // // //         {...props}
// // // // // // // //       />
// // // // // // // //     ),
// // // // // // // //     []
// // // // // // // //   );

// // // // // // // //   if (!accessToken) {
// // // // // // // //     return (
// // // // // // // //       <SafeAreaView style={styles.errorContainer}>
// // // // // // // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // // // // // // //         <Text style={styles.errorText}>Map access token is required</Text>
// // // // // // // //       </SafeAreaView>
// // // // // // // //     );
// // // // // // // //   }

// // // // // // // //   Mapbox.setAccessToken(accessToken);

// // // // // // // //   return (
// // // // // // // //     <SafeAreaView style={styles.container}>
// // // // // // // //       <StatusBar style="light" />
// // // // // // // //       {showLoader && (
// // // // // // // //         <Modal transparent animationType="fade">
// // // // // // // //           <View style={styles.loaderContainer}>
// // // // // // // //             <ActivityIndicator size="large" color="#FF9800" />
// // // // // // // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // // // // // // //           </View>
// // // // // // // //         </Modal>
// // // // // // // //       )}

// // // // // // // //       <MapView
// // // // // // // //         style={styles.map}
// // // // // // // //         styleURL={MAP_STYLE}
// // // // // // // //         zoomEnabled
// // // // // // // //         rotateEnabled
// // // // // // // //       >
// // // // // // // //         <Camera
// // // // // // // //           ref={cameraRef}
// // // // // // // //           followUserLocation
// // // // // // // //           followZoomLevel={INITIAL_ZOOM}
// // // // // // // //           animationMode="flyTo"
// // // // // // // //         />

// // // // // // // //         <LocationPuck
// // // // // // // //           visible
// // // // // // // //           pulsing={{
// // // // // // // //             isEnabled: true,
// // // // // // // //             color: '#FF9800',
// // // // // // // //             radius: 100,
// // // // // // // //           }}
// // // // // // // //         />

// // // // // // // //         {pickupCoords && (
// // // // // // // //           <ShapeSource
// // // // // // // //             id="pickupPoint"
// // // // // // // //             shape={{
// // // // // // // //               type: 'Feature',
// // // // // // // //               properties: {},
// // // // // // // //               geometry: {
// // // // // // // //                 type: 'Point',
// // // // // // // //                 coordinates: pickupCoords,
// // // // // // // //               },
// // // // // // // //             }}
// // // // // // // //           >
// // // // // // // //             <SymbolLayer
// // // // // // // //               id="pickupSymbol"
// // // // // // // //               style={{
// // // // // // // //                 iconImage: 'mapbox://markers/pickup-pin',
// // // // // // // //                 iconSize: 1.5,
// // // // // // // //                 iconOffset: [0, -15],
// // // // // // // //               }}
// // // // // // // //             />
// // // // // // // //           </ShapeSource>
// // // // // // // //         )}

// // // // // // // //         {destinationCoords && (
// // // // // // // //           <ShapeSource
// // // // // // // //             id="destinationPoint"
// // // // // // // //             shape={{
// // // // // // // //               type: 'Feature',
// // // // // // // //               properties: {},
// // // // // // // //               geometry: {
// // // // // // // //                 type: 'Point',
// // // // // // // //                 coordinates: destinationCoords,
// // // // // // // //               },
// // // // // // // //             }}
// // // // // // // //           >
// // // // // // // //             <SymbolLayer
// // // // // // // //               id="destinationSymbol"
// // // // // // // //               style={{
// // // // // // // //                 iconImage: 'mapbox://markers/destination-pin',
// // // // // // // //                 iconSize: 1.5,
// // // // // // // //                 iconOffset: [0, -15],
// // // // // // // //               }}
// // // // // // // //             />
// // // // // // // //           </ShapeSource>
// // // // // // // //         )}

// // // // // // // //         {routeCoordinates && (
// // // // // // // //           <ShapeSource
// // // // // // // //             id="routeLine"
// // // // // // // //             lineMetrics
// // // // // // // //             shape={{
// // // // // // // //               type: 'Feature',
// // // // // // // //               properties: {},
// // // // // // // //               geometry: {
// // // // // // // //                 type: 'LineString',
// // // // // // // //                 coordinates: routeCoordinates,
// // // // // // // //               },
// // // // // // // //             }}
// // // // // // // //           >
// // // // // // // //             <LineLayer
// // // // // // // //               id="routePath"
// // // // // // // //               style={{
// // // // // // // //                 lineColor: '#FF9800',
// // // // // // // //                 lineCap: 'round',
// // // // // // // //                 lineJoin: 'round',
// // // // // // // //                 lineWidth: 4,
// // // // // // // //                 lineGradient: [
// // // // // // // //                   'interpolate',
// // // // // // // //                   ['linear'],
// // // // // // // //                   ['line-progress'],
// // // // // // // //                   0,
// // // // // // // //                   '#4CAF50',
// // // // // // // //                   1,
// // // // // // // //                   '#FF9800',
// // // // // // // //                 ],
// // // // // // // //               }}
// // // // // // // //             />
// // // // // // // //           </ShapeSource>
// // // // // // // //         )}
// // // // // // // //       </MapView>

// // // // // // // //       <View style={styles.actionContainer}>
// // // // // // // //         <TouchableOpacity
// // // // // // // //           style={styles.locationButton}
// // // // // // // //           onPress={handleSheetOpen}
// // // // // // // //         >
// // // // // // // //           <MaterialIcons name="add-location" size={24} color="white" />
// // // // // // // //           <Text style={styles.buttonText}>Set Location</Text>
// // // // // // // //         </TouchableOpacity>

// // // // // // // //         {distance && (
// // // // // // // //           <TouchableOpacity
// // // // // // // //             style={styles.continueButton}
// // // // // // // //             onPress={() => router.push('/vehicles')}
// // // // // // // //           >
// // // // // // // //             <MaterialIcons name="directions-car" size={24} color="white" />
// // // // // // // //             <Text style={styles.buttonText}>{distance}</Text>
// // // // // // // //           </TouchableOpacity>
// // // // // // // //         )}
// // // // // // // //       </View>

// // // // // // // //       <BottomSheet
// // // // // // // //         ref={bottomSheetRef}
// // // // // // // //         index={-1}
// // // // // // // //         snapPoints={snapPoints}
// // // // // // // //         enablePanDownToClose
// // // // // // // //         backdropComponent={renderBackdrop}
// // // // // // // //       >
// // // // // // // //         <View style={styles.bottomSheetContent}>
// // // // // // // //           <Text style={styles.sheetTitle}>Where to?</Text>
// // // // // // // //           <View style={styles.inputContainer}>
// // // // // // // //             <MaterialIcons name="my-location" size={24} color="#FF9800" />
// // // // // // // //             <BottomSheetTextInput
// // // // // // // //               style={styles.input}
// // // // // // // //               placeholder="Pickup Location"
// // // // // // // //               value={fromLocation}
// // // // // // // //               onChangeText={setFromLocation}
// // // // // // // //             />
// // // // // // // //           </View>
// // // // // // // //           <View style={styles.inputContainer}>
// // // // // // // //             <MaterialIcons name="location-on" size={24} color="#FF9800" />
// // // // // // // //             <BottomSheetTextInput
// // // // // // // //               style={styles.input}
// // // // // // // //               placeholder="Destination"
// // // // // // // //               value={toLocation}
// // // // // // // //               onChangeText={setToLocation}
// // // // // // // //             />
// // // // // // // //           </View>
// // // // // // // //           <TouchableOpacity
// // // // // // // //             style={styles.routeButton}
// // // // // // // //             onPress={handleGetDirections}
// // // // // // // //             disabled={isLoading}
// // // // // // // //           >
// // // // // // // //             <MaterialIcons name="near-me" size={24} color="white" />
// // // // // // // //             <Text style={styles.buttonText}>
// // // // // // // //               {isLoading ? 'Loading...' : 'Get Route'}
// // // // // // // //             </Text>
// // // // // // // //           </TouchableOpacity>
// // // // // // // //         </View>
// // // // // // // //       </BottomSheet>
// // // // // // // //     </SafeAreaView>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //   container: { flex: 1 },
// // // // // // // //   map: { width, height },
// // // // // // // //   actionContainer: {
// // // // // // // //     position: 'absolute',
// // // // // // // //     bottom: '10%',
// // // // // // // //     left: '10%',
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     justifyContent: 'space-around',
// // // // // // // //   },
// // // // // // // //   locationButton: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     backgroundColor: '#FF9800',
// // // // // // // //     padding: 10,
// // // // // // // //     borderRadius: 10,
// // // // // // // //   },
// // // // // // // //   continueButton: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     backgroundColor: '#4CAF50',
// // // // // // // //     padding: 10,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     marginLeft: 10,
// // // // // // // //   },
// // // // // // // //   buttonText: {
// // // // // // // //     color: 'white',
// // // // // // // //     marginLeft: 5,
// // // // // // // //   },
// // // // // // // //   bottomSheetContent: { padding: 20 },
// // // // // // // //   sheetTitle: { fontSize: 16, fontWeight: '600' },
// // // // // // // //   inputContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
// // // // // // // //   input: { marginLeft: 10, flex: 1 },
// // // // // // // //   routeButton: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     backgroundColor: '#FF9800',
// // // // // // // //     padding: 10,
// // // // // // // //     borderRadius: 10,
// // // // // // // //     marginTop: 20,
// // // // // // // //   },
// // // // // // // //   loaderContainer: {
// // // // // // // //     flex: 1,
// // // // // // // //     alignItems: 'center',
// // // // // // // //     justifyContent: 'center',
// // // // // // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // // // // // //   },
// // // // // // // //   loaderText: { color: '#FF9800', marginTop: 10 },
// // // // // // // //   errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
// // // // // // // //   errorText: { color: 'red', fontSize: 18 },
// // // // // // // // });

// // // // // // // // export default MapScreen;





// // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // import {
// // // // // // // // //   StyleSheet,
// // // // // // // // //   Text,
// // // // // // // // //   TouchableOpacity,
// // // // // // // // //   View,
// // // // // // // // //   Alert,
// // // // // // // // //   ActivityIndicator,
// // // // // // // // //   Modal,
// // // // // // // // //   Dimensions,
// // // // // // // // //   Platform,
// // // // // // // // // } from 'react-native';
// // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // import Mapbox, {
// // // // // // // // //   Camera,
// // // // // // // // //   LineLayer,
// // // // // // // // //   LocationPuck,
// // // // // // // // //   MapView,
// // // // // // // // //   ShapeSource,
// // // // // // // // //   SymbolLayer,
// // // // // // // // // } from '@rnmapbox/maps';
// // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // import BottomSheet, {
// // // // // // // // //   BottomSheetBackdrop,
// // // // // // // // //   BottomSheetTextInput,
// // // // // // // // // } from '@gorhom/bottom-sheet';
// // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // import { useDispatch } from 'react-redux';
// // // // // // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';
// // // // // // // // // import { MaterialIcons } from '@expo/vector-icons';

// // // // // // // // // const { width, height } = Dimensions.get('window');

// // // // // // // // // const MAP_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';
// // // // // // // // // const INITIAL_ZOOM = 15;
// // // // // // // // // const ANIMATION_DURATION = 2000;

// // // // // // // // // interface Coordinates {
// // // // // // // // //   latitude: number;
// // // // // // // // //   longitude: number;
// // // // // // // // // }

// // // // // // // // // const MapScreen = () => {
// // // // // // // // //   const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // //   const [fromLocation, setFromLocation] = useState('');
// // // // // // // // //   const [toLocation, setToLocation] = useState('');
// // // // // // // // //   const [pickupCoords, setPickupCoords] = useState<number[] | null>(null);
// // // // // // // // //   const [destinationCoords, setDestinationCoords] = useState<number[] | null>(null);
// // // // // // // // //   const [routeCoordinates, setRouteCoordinates] = useState<number[][] | null>(null);
// // // // // // // // //   const [distance, setDistance] = useState<string | null>(null);
// // // // // // // // //   const [isLoading, setIsLoading] = useState(false);
// // // // // // // // //   const [showLoader, setShowLoader] = useState(false);

// // // // // // // // //   const router = useRouter();
// // // // // // // // //   const dispatch = useDispatch();
// // // // // // // // //   const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // // //   const cameraRef = useRef<Camera>(null);

// // // // // // // // //   const snapPoints = ['25%', '50%', '75%'];

// // // // // // // // //   const handleSheetOpen = () => bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // //   const handleSheetClose = () => bottomSheetRef.current?.close();

// // // // // // // // //   const calculateDistance = (start: number[], end: number[]): string => {
// // // // // // // // //     if (!start || !end) return 'N/A';

// // // // // // // // //     const R = 6371e3; // Earth's radius in meters
// // // // // // // // //     const φ1 = (start[1] * Math.PI) / 180;
// // // // // // // // //     const φ2 = (end[1] * Math.PI) / 180;
// // // // // // // // //     const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
// // // // // // // // //     const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

// // // // // // // // //     const a =
// // // // // // // // //       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
// // // // // // // // //       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // // // // // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // // // // // // //     const distance = (R * c) / 1000; // Convert to kilometers
// // // // // // // // //     return `${distance.toFixed(2)} km`;
// // // // // // // // //   };

// // // // // // // // //   const fetchLocationCoordinates = async () => {
// // // // // // // // //     try {
// // // // // // // // //       const [pickup, destination] = await geoCoding(fromLocation, toLocation);
// // // // // // // // //       setPickupCoords(pickup);
// // // // // // // // //       setDestinationCoords(destination);

// // // // // // // // //       if (pickup) dispatch(setOrigin(pickup));
// // // // // // // // //       if (destination) dispatch(setDestination(destination));

// // // // // // // // //       return { pickup, destination };
// // // // // // // // //     } catch (error: any) {
// // // // // // // // //       Alert.alert('Location Error', 'Unable to find the specified locations. Please try again.');
// // // // // // // // //       throw error;
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const handleGetDirections = async () => {
// // // // // // // // //     if (!fromLocation || !toLocation) {
// // // // // // // // //       Alert.alert('Input Error', 'Please enter both pickup and destination locations');
// // // // // // // // //       return;
// // // // // // // // //     }

// // // // // // // // //     setIsLoading(true);
// // // // // // // // //     setShowLoader(true);

// // // // // // // // //     try {
// // // // // // // // //       const { pickup, destination } = await fetchLocationCoordinates();
      
// // // // // // // // //       if (pickup && destination) {
// // // // // // // // //         const directions = await getDirections({
// // // // // // // // //           pickupCoordinates: pickup as [number, number],
// // // // // // // // //           destinationCoordinates: destination as [number, number],
// // // // // // // // //         });

// // // // // // // // //         setRouteCoordinates(directions);
// // // // // // // // //         setDistance(calculateDistance(pickup, destination));

// // // // // // // // //         // Animate camera to show the route
// // // // // // // // //         cameraRef.current?.flyTo({
// // // // // // // // //           centerCoordinate: [
// // // // // // // // //             (pickup[0] + destination[0]) / 2,
// // // // // // // // //             (pickup[1] + destination[1]) / 2,
// // // // // // // // //           ],
// // // // // // // // //           zoomLevel: 12,
// // // // // // // // //           duration: ANIMATION_DURATION,
// // // // // // // // //         });

// // // // // // // // //         handleSheetClose();
// // // // // // // // //       }
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error('Direction Error:', error);
// // // // // // // // //     } finally {
// // // // // // // // //       setIsLoading(false);
// // // // // // // // //       setShowLoader(false);
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const renderBackdrop = useCallback(
// // // // // // // // //     (props: any) => (
// // // // // // // // //       <BottomSheetBackdrop
// // // // // // // // //         appearsOnIndex={1}
// // // // // // // // //         disappearsOnIndex={0}
// // // // // // // // //         {...props}
// // // // // // // // //       />
// // // // // // // // //     ),
// // // // // // // // //     []
// // // // // // // // //   );

// // // // // // // // //   if (!accessToken) {
// // // // // // // // //     return (
// // // // // // // // //       <SafeAreaView style={styles.errorContainer}>
// // // // // // // // //         <MaterialIcons name="error-outline" size={48} color="red" />
// // // // // // // // //         <Text style={styles.errorText}>Map access token is required</Text>
// // // // // // // // //       </SafeAreaView>
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // //   Mapbox.setAccessToken(accessToken);

// // // // // // // // //   return (
// // // // // // // // //     <SafeAreaView style={styles.container}>
// // // // // // // // //       <StatusBar style="light" />
      
// // // // // // // // //       {showLoader && (
// // // // // // // // //         <Modal transparent animationType="fade">
// // // // // // // // //           <View style={styles.loaderContainer}>
// // // // // // // // //             <ActivityIndicator size="large" color="#FF9800" />
// // // // // // // // //             <Text style={styles.loaderText}>Finding the best route...</Text>
// // // // // // // // //           </View>
// // // // // // // // //         </Modal>
// // // // // // // // //       )}

// // // // // // // // //       <MapView
// // // // // // // // //         style={styles.map}
// // // // // // // // //         styleURL={MAP_STYLE}
// // // // // // // // //         zoomEnabled
// // // // // // // // //         rotateEnabled
// // // // // // // // //       >
// // // // // // // // //         <Camera
// // // // // // // // //           ref={cameraRef}
// // // // // // // // //           followUserLocation
// // // // // // // // //           followZoomLevel={INITIAL_ZOOM}
// // // // // // // // //           animationMode="flyTo"
// // // // // // // // //         />

// // // // // // // // //         <LocationPuck
// // // // // // // // //           visible
// // // // // // // // //           pulsing={{
// // // // // // // // //             isEnabled: true,
// // // // // // // // //             color: '#FF9800',
// // // // // // // // //             radius: 100,
// // // // // // // // //           }}
// // // // // // // // //         />

// // // // // // // // //         {pickupCoords && (
// // // // // // // // //           <ShapeSource
// // // // // // // // //             id="pickupPoint"
// // // // // // // // //             shape={{
// // // // // // // // //               type: 'Feature',
// // // // // // // // //               properties: {},
// // // // // // // // //               geometry: {
// // // // // // // // //                 type: 'Point',
// // // // // // // // //                 coordinates: pickupCoords,
// // // // // // // // //               },
// // // // // // // // //             }}
// // // // // // // // //           >
// // // // // // // // //             <SymbolLayer
// // // // // // // // //               id="pickupSymbol"
// // // // // // // // //               style={{
// // // // // // // // //                 iconImage: 'mapbox://markers/pickup-pin',
// // // // // // // // //                 iconSize: 1.5,
// // // // // // // // //                 iconOffset: [0, -15],
// // // // // // // // //               }}
// // // // // // // // //             />
// // // // // // // // //           </ShapeSource>
// // // // // // // // //         )}

// // // // // // // // //         {destinationCoords && (
// // // // // // // // //           <ShapeSource
// // // // // // // // //             id="destinationPoint"
// // // // // // // // //             shape={{
// // // // // // // // //               type: 'Feature',
// // // // // // // // //               properties: {},
// // // // // // // // //               geometry: {
// // // // // // // // //                 type: 'Point',
// // // // // // // // //                 coordinates: destinationCoords,
// // // // // // // // //               },
// // // // // // // // //             }}
// // // // // // // // //           >
// // // // // // // // //             <SymbolLayer
// // // // // // // // //               id="destinationSymbol"
// // // // // // // // //               style={{
// // // // // // // // //                 iconImage: 'mapbox://markers/destination-pin',
// // // // // // // // //                 iconSize: 1.5,
// // // // // // // // //                 iconOffset: [0, -15],
// // // // // // // // //               }}
// // // // // // // // //             />
// // // // // // // // //           </ShapeSource>
// // // // // // // // //         )}

// // // // // // // // //         {routeCoordinates && (
// // // // // // // // //           <ShapeSource
// // // // // // // // //             id="routeLine"
// // // // // // // // //             lineMetrics
// // // // // // // // //             shape={{
// // // // // // // // //               type: 'Feature',
// // // // // // // // //               properties: {},
// // // // // // // // //               geometry: {
// // // // // // // // //                 type: 'LineString',
// // // // // // // // //                 coordinates: routeCoordinates,
// // // // // // // // //               },
// // // // // // // // //             }}
// // // // // // // // //           >
// // // // // // // // //             <LineLayer
// // // // // // // // //               id="routePath"
// // // // // // // // //               style={{
// // // // // // // // //                 lineColor: '#FF9800',
// // // // // // // // //                 lineCap: 'round',
// // // // // // // // //                 lineJoin: 'round',
// // // // // // // // //                 lineWidth: 4,
// // // // // // // // //                 lineGradient: [
// // // // // // // // //                   'interpolate',
// // // // // // // // //                   ['linear'],
// // // // // // // // //                   ['line-progress'],
// // // // // // // // //                   0,
// // // // // // // // //                   '#4CAF50',
// // // // // // // // //                   1,
// // // // // // // // //                   '#FF9800',
// // // // // // // // //                 ],
// // // // // // // // //               }}
// // // // // // // // //             />
// // // // // // // // //           </ShapeSource>
// // // // // // // // //         )}
// // // // // // // // //       </MapView>

// // // // // // // // //       <View style={styles.actionContainer}>
// // // // // // // // //         <TouchableOpacity
// // // // // // // // //           style={styles.locationButton}
// // // // // // // // //           onPress={handleSheetOpen}
// // // // // // // // //         >
// // // // // // // // //           <MaterialIcons name="add-location" size={24} color="white" />
// // // // // // // // //           <Text style={styles.buttonText}>Set Location</Text>
// // // // // // // // //         </TouchableOpacity>

// // // // // // // // //         {distance && (
// // // // // // // // //           <TouchableOpacity
// // // // // // // // //             style={styles.continueButton}
// // // // // // // // //             onPress={() => router.push('/vehicles')}
// // // // // // // // //           >
// // // // // // // // //             <MaterialIcons name="directions-car" size={24} color="white" />
// // // // // // // // //             <Text style={styles.buttonText}>{distance}</Text>
// // // // // // // // //           </TouchableOpacity>
// // // // // // // // //         )}
// // // // // // // // //       </View>

// // // // // // // // //       <BottomSheet
// // // // // // // // //         ref={bottomSheetRef}
// // // // // // // // //         index={-1}
// // // // // // // // //         snapPoints={snapPoints}
// // // // // // // // //         enablePanDownToClose
// // // // // // // // //         backdropComponent={renderBackdrop}
// // // // // // // // //       >
// // // // // // // // //         <View style={styles.bottomSheetContent}>
// // // // // // // // //           <Text style={styles.sheetTitle}>Where to?</Text>
          
// // // // // // // // //           <View style={styles.inputContainer}>
// // // // // // // // //             <MaterialIcons name="my-location" size={24} color="#FF9800" />
// // // // // // // // //             <BottomSheetTextInput
// // // // // // // // //               style={styles.input}
// // // // // // // // //               placeholder="Pickup Location"
// // // // // // // // //               value={fromLocation}
// // // // // // // // //               onChangeText={setFromLocation}
// // // // // // // // //               placeholderTextColor="#666"
// // // // // // // // //             />
// // // // // // // // //           </View>

// // // // // // // // //           <View style={styles.inputContainer}>
// // // // // // // // //             <MaterialIcons name="location-on" size={24} color="#FF9800" />
// // // // // // // // //             <BottomSheetTextInput
// // // // // // // // //               style={styles.input}
// // // // // // // // //               placeholder="Destination"
// // // // // // // // //               value={toLocation}
// // // // // // // // //               onChangeText={setToLocation}
// // // // // // // // //               placeholderTextColor="#666"
// // // // // // // // //             />
// // // // // // // // //           </View>

// // // // // // // // //           <TouchableOpacity
// // // // // // // // //             style={[
// // // // // // // // //               styles.searchButton,
// // // // // // // // //               (!fromLocation || !toLocation) && styles.disabledButton,
// // // // // // // // //             ]}
// // // // // // // // //             onPress={handleGetDirections}
// // // // // // // // //             disabled={isLoading || !fromLocation || !toLocation}
// // // // // // // // //           >
// // // // // // // // //             <Text style={styles.searchButtonText}>
// // // // // // // // //               {isLoading ? 'Searching...' : 'Get Directions'}
// // // // // // // // //             </Text>
// // // // // // // // //           </TouchableOpacity>
// // // // // // // // //         </View>
// // // // // // // // //       </BottomSheet>
// // // // // // // // //     </SafeAreaView>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // //   container: {
// // // // // // // // //     flex: 1,
// // // // // // // // //     backgroundColor: '#000',
// // // // // // // // //   },
// // // // // // // // //   map: {
// // // // // // // // //     flex: 1,
// // // // // // // // //   },
// // // // // // // // //   errorContainer: {
// // // // // // // // //     flex: 1,
// // // // // // // // //     justifyContent: 'center',
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     backgroundColor: '#fff',
// // // // // // // // //     padding: 20,
// // // // // // // // //   },
// // // // // // // // //   errorText: {
// // // // // // // // //     fontSize: 18,
// // // // // // // // //     fontWeight: 'bold',
// // // // // // // // //     color: 'red',
// // // // // // // // //     marginTop: 10,
// // // // // // // // //     textAlign: 'center',
// // // // // // // // //   },
// // // // // // // // //   actionContainer: {
// // // // // // // // //     position: 'absolute',
// // // // // // // // //     bottom: Platform.OS === 'ios' ? 40 : 20,
// // // // // // // // //     left: 20,
// // // // // // // // //     right: 20,
// // // // // // // // //     flexDirection: 'row',
// // // // // // // // //     justifyContent: 'space-between',
// // // // // // // // //   },
// // // // // // // // //   locationButton: {
// // // // // // // // //     backgroundColor: '#FF9800',
// // // // // // // // //     flexDirection: 'row',
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     paddingVertical: 12,
// // // // // // // // //     paddingHorizontal: 20,
// // // // // // // // //     borderRadius: 25,
// // // // // // // // //     elevation: 3,
// // // // // // // // //     shadowColor: '#000',
// // // // // // // // //     shadowOffset: { width: 0, height: 2 },
// // // // // // // // //     shadowOpacity: 0.25,
// // // // // // // // //     shadowRadius: 3.84,
// // // // // // // // //   },
// // // // // // // // //   continueButton: {
// // // // // // // // //     backgroundColor: '#4CAF50',
// // // // // // // // //     flexDirection: 'row',
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     paddingVertical: 12,
// // // // // // // // //     paddingHorizontal: 20,
// // // // // // // // //     borderRadius: 25,
// // // // // // // // //     elevation: 3,
// // // // // // // // //     shadowColor: '#000',
// // // // // // // // //     shadowOffset: { width: 0, height: 2 },
// // // // // // // // //     shadowOpacity: 0.25,
// // // // // // // // //     shadowRadius: 3.84,
// // // // // // // // //   },
// // // // // // // // //   buttonText: {
// // // // // // // // //     fontSize: 16,
// // // // // // // // //     fontWeight: '600',
// // // // // // // // //     color: '#fff',
// // // // // // // // //     marginLeft: 8,
// // // // // // // // //   },
// // // // // // // // //   loaderContainer: {
// // // // // // // // //     flex: 1,
// // // // // // // // //     justifyContent: 'center',
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     backgroundColor: 'rgba(0, 0, 0, 0.7)',
// // // // // // // // //   },
// // // // // // // // //   loaderText: {
// // // // // // // // //     marginTop: 12,
// // // // // // // // //     fontSize: 16,
// // // // // // // // //     color: '#fff',
// // // // // // // // //     fontWeight: '500',
// // // // // // // // //   },
// // // // // // // // //   bottomSheetContent: {
// // // // // // // // //     padding: 20,
// // // // // // // // //   },
// // // // // // // // //   sheetTitle: {
// // // // // // // // //     fontSize: 24,
// // // // // // // // //     fontWeight: 'bold',
// // // // // // // // //     marginBottom: 20,
// // // // // // // // //     color: '#333',
// // // // // // // // //   },
// // // // // // // // //   inputContainer: {
// // // // // // // // //     flexDirection: 'row',
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     backgroundColor: '#f5f5f5',
// // // // // // // // //     borderRadius: 12,
// // // // // // // // //     marginBottom: 15,
// // // // // // // // //     padding: 12,
// // // // // // // // //     borderWidth: 1,
// // // // // // // // //     borderColor: '#e0e0e0',
// // // // // // // // //   },
// // // // // // // // //   input: {
// // // // // // // // //     flex: 1,
// // // // // // // // //     marginLeft: 10,
// // // // // // // // //     fontSize: 16,
// // // // // // // // //     color: '#333',
// // // // // // // // //   },
// // // // // // // // //   searchButton: {
// // // // // // // // //     backgroundColor: '#FF9800',
// // // // // // // // //     padding: 16,
// // // // // // // // //     borderRadius: 12,
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     marginTop: 10,
// // // // // // // // //     elevation: 2,
// // // // // // // // //     shadowColor: '#000',
// // // // // // // // //     shadowOffset: { width: 0, height: 2 },
// // // // // // // // //     shadowOpacity: 0.25,
// // // // // // // // //     shadowRadius: 3.84,
// // // // // // // // //   },
// // // // // // // // //   searchButtonText: {
// // // // // // // // //     color: '#fff',
// // // // // // // // //     fontSize: 18,
// // // // // // // // //     fontWeight: '600',
// // // // // // // // //   },
// // // // // // // // //   disabledButton: {
// // // // // // // // //     backgroundColor: '#ccc',
// // // // // // // // //     elevation: 0,
// // // // // // // // //   },
// // // // // // // // // });

// // // // // // // // // export default MapScreen;




// // // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Modal } from 'react-native';
// // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // import { useDispatch } from 'react-redux';
// // // // // // // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';

// // // // // // // // // // const Home_Page = () => {
// // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // //     const [distance, setDistance] = useState<string | null>(null);
// // // // // // // // // //     const [isLoading, setIsLoading] = useState(false);
// // // // // // // // // //     const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
// // // // // // // // // //     const router = useRouter();
// // // // // // // // // //     const snapPoints = ['25%', '50%', '75%', '80%'];
// // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // // // //     const cameraRef = useRef<Camera>(null);
// // // // // // // // // //     const dispatch = useDispatch();

// // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // //     };

// // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // //     };

// // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // //         try {
// // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // //             setDestinationLocation(destinationCoordinates);

// // // // // // // // // //             if (pickupCoordinates) {
// // // // // // // // // //                 dispatch(setOrigin(pickupCoordinates));
// // // // // // // // // //             }
// // // // // // // // // //             if (destinationCoordinates) {
// // // // // // // // // //                 dispatch(setDestination(destinationCoordinates));
// // // // // // // // // //             }
// // // // // // // // // //         } catch (error: any) {
// // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // //         }
// // // // // // // // // //     };

// // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // //         setIsLoading(true);
// // // // // // // // // //         setShowFullScreenLoader(true);
// // // // // // // // // //         try {
// // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number],
// // // // // // // // // //                 });
// // // // // // // // // //                 setDirectionCoordinates(directions);

// // // // // // // // // //                 // Calculate distance
// // // // // // // // // //                 const calculatedDistance = calculateDistance(pickupLocation, destinationLocation);
// // // // // // // // // //                 setDistance(calculatedDistance);

// // // // // // // // // //                 // Trigger camera animation
// // // // // // // // // //                 if (cameraRef.current) {
// // // // // // // // // //                     cameraRef.current.flyTo({
// // // // // // // // // //                         centerCoordinate: [
// // // // // // // // // //                             (pickupLocation[0] + destinationLocation[0]) / 2,
// // // // // // // // // //                             (pickupLocation[1] + destinationLocation[1]) / 2,
// // // // // // // // // //                         ],
// // // // // // // // // //                         zoomLevel: 12,
// // // // // // // // // //                         duration: 2000, // animation duration in milliseconds
// // // // // // // // // //                     });
// // // // // // // // // //                 }
// // // // // // // // // //                 handleClosePress();
// // // // // // // // // //             }
// // // // // // // // // //         } catch (error: any) {
// // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // //         } finally {
// // // // // // // // // //             setIsLoading(false);
// // // // // // // // // //             setShowFullScreenLoader(false);
// // // // // // // // // //         }
// // // // // // // // // //     };

// // // // // // // // // //     const calculateDistance = (coords1: number[] | null, coords2: number[] | null) => {
// // // // // // // // // //         if (!coords1 || !coords2) return 'N/A';
// // // // // // // // // //         const lat1 = coords1[1];
// // // // // // // // // //         const lon1 = coords1[0];
// // // // // // // // // //         const lat2 = coords2[1];
// // // // // // // // // //         const lon2 = coords2[0];
// // // // // // // // // //         const R = 6371e3; // meters
// // // // // // // // // //         const φ1 = (lat1 * Math.PI) / 180;
// // // // // // // // // //         const φ2 = (lat2 * Math.PI) / 180;
// // // // // // // // // //         const Δφ = ((lat2 - lat1) * Math.PI) / 180;
// // // // // // // // // //         const Δλ = ((lon2 - lon1) * Math.PI) / 180;

// // // // // // // // // //         const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // // // // // // //         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // // // // // // // //         const distance = R * c;
// // // // // // // // // //         return (distance / 1000).toFixed(2) + ' km';
// // // // // // // // // //     };

// // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // //         []
// // // // // // // // // //     );

// // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // //         router.push('/vehicles');
// // // // // // // // // //     };

// // // // // // // // // //     if (!accessToken) {
// // // // // // // // // //         return (
// // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // //             </SafeAreaView>
// // // // // // // // // //         );
// // // // // // // // // //     }

// // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // //     return (
// // // // // // // // // //         <>
// // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // //                 {showFullScreenLoader && (
// // // // // // // // // //                     <Modal transparent={true} animationType="fade">
// // // // // // // // // //                         <View style={styles.loaderContainer}>
// // // // // // // // // //                             <ActivityIndicator size="large" color="orange" />
// // // // // // // // // //                             <Text style={styles.loaderText}>Fetching Directions...</Text>
// // // // // // // // // //                         </View>
// // // // // // // // // //                     </Modal>
// // // // // // // // // //                 )}

// // // // // // // // // //                 <MapView
// // // // // // // // // //                     style={styles.map}
// // // // // // // // // //                     styleURL="mapbox://styles/mapbox/navigation-night-v1"
// // // // // // // // // //                     zoomEnabled
// // // // // // // // // //                     rotateEnabled
// // // // // // // // // //                 >
// // // // // // // // // //                     <Camera ref={cameraRef} followUserLocation followZoomLevel={15} animationMode="flyTo" />

// // // // // // // // // //                     <LocationPuck
// // // // // // // // // //                         topImage="topImage"
// // // // // // // // // //                         visible
// // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // //                         pulsing={{
// // // // // // // // // //                             isEnabled: true,
// // // // // // // // // //                             color: 'orange',
// // // // // // // // // //                             radius: 100.0,
// // // // // // // // // //                         }}
// // // // // // // // // //                     />

// // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // //                         <ShapeSource
// // // // // // // // // //                             id="pickupSource"
// // // // // // // // // //                             shape={{
// // // // // // // // // //                                 properties: {},
// // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // //                                 geometry: {
// // // // // // // // // //                                     type: 'Point',
// // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // //                                 },
// // // // // // // // // //                             }}
// // // // // // // // // //                         >
// // // // // // // // // //                             <SymbolLayer
// // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // //                                 style={{
// // // // // // // // // //                                     iconImage: 'mapbox://markers/pickup-pin',
// // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // //                                 }}
// // // // // // // // // //                             />
// // // // // // // // // //                         </ShapeSource>
// // // // // // // // // //                     )}

// // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // //                         <ShapeSource
// // // // // // // // // //                             id="destinationSource"
// // // // // // // // // //                             shape={{
// // // // // // // // // //                                 properties: {},
// // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // //                                 geometry: {
// // // // // // // // // //                                     type: 'Point',
// // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // //                                 },
// // // // // // // // // //                             }}
// // // // // // // // // //                         >
// // // // // // // // // //                             <SymbolLayer
// // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // //                                 style={{
// // // // // // // // // //                                     iconImage: 'mapbox://markers/destination-pin',
// // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // //                                 }}
// // // // // // // // // //                             />
// // // // // // // // // //                         </ShapeSource>
// // // // // // // // // //                     )}

// // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // //                         <ShapeSource
// // // // // // // // // //                             id="routeSource"
// // // // // // // // // //                             lineMetrics
// // // // // // // // // //                             shape={{
// // // // // // // // // //                                 properties: {},
// // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // //                                 geometry: {
// // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // //                                 },
// // // // // // // // // //                             }}
// // // // // // // // // //                         >
// // // // // // // // // //                             <LineLayer
// // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // //                                 style={{
// // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // //                                     lineWidth: 7,
// // // // // // // // // //                                     lineDasharray: [1, 3],
// // // // // // // // // //                                     lineGradient: [
// // // // // // // // // //                                         'interpolate',
// // // // // // // // // //                                         ['linear'],
// // // // // // // // // //                                         ['line-progress'],
// // // // // // // // // //                                         0, 'blue',
// // // // // // // // // //                                         1, 'yellow',
// // // // // // // // // //                                     ],
// // // // // // // // // //                                 }}
// // // // // // // // // //                             />
// // // // // // // // // //                         </ShapeSource>
// // // // // // // // // //                     )}
// // // // // // // // // //                 </MapView>

// // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // //                     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // //                         <Text style={styles.buttonText}>Enter Locations</Text>
// // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // //                     {distance && (
// // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={navigateToNextScreen}>
// // // // // // // // // //                             <Text style={styles.distanceText}>Distance: {distance}</Text>
// // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // //                     )}
// // // // // // // // // //                 </View>

// // // // // // // // // //                 <BottomSheet
// // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // //                     index={0}
// // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // //                     enablePanDownToClose
// // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // //                 >
// // // // // // // // // //                     <View style={styles.bottomSheetContent}>
// // // // // // // // // //                         <Text style={styles.sheetTitle}>Enter Locations</Text>
// // // // // // // // // //                         <BottomSheetTextInput
// // // // // // // // // //                             style={styles.sheetTextInput}
// // // // // // // // // //                             placeholder="Pickup Location"
// // // // // // // // // //                             value={from}
// // // // // // // // // //                             onChangeText={setFrom}
// // // // // // // // // //                         />
// // // // // // // // // //                         <BottomSheetTextInput
// // // // // // // // // //                             style={styles.sheetTextInput}
// // // // // // // // // //                             placeholder="Destination Location"
// // // // // // // // // //                             value={to}
// // // // // // // // // //                             onChangeText={setTo}
// // // // // // // // // //                         />
// // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue} disabled={isLoading}>
// // // // // // // // // //                             <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Get Directions'}</Text>
// // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // //                     </View>
// // // // // // // // // //                 </BottomSheet>
// // // // // // // // // //             </View>
// // // // // // // // // //         </>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default Home_Page;

// // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // //     container: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //     },
// // // // // // // // // //     map: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //     },
// // // // // // // // // //     errorContainer: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // //     },
// // // // // // // // // //     errorText: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         color: '#ff0000',
// // // // // // // // // //     },
// // // // // // // // // //     buttonContainer: {
// // // // // // // // // //         position: 'absolute',
// // // // // // // // // //         bottom: 30,
// // // // // // // // // //         left: 20,
// // // // // // // // // //         right: 20,
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // //     },
// // // // // // // // // //     enterLocationButton: {
// // // // // // // // // //         backgroundColor: 'gray',
// // // // // // // // // //         paddingVertical: 12,
// // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // //         borderRadius: 20,
// // // // // // // // // //         elevation: 3,
// // // // // // // // // //         marginRight: 5,
// // // // // // // // // //     },
// // // // // // // // // //     continueButton: {
// // // // // // // // // //         backgroundColor: 'orange',
// // // // // // // // // //         paddingVertical: 12,
// // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // //         borderRadius: 20,
// // // // // // // // // //         elevation: 3,
// // // // // // // // // //         marginRight: 5,
// // // // // // // // // //     },
// // // // // // // // // //     buttonText: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         fontWeight: '600',
// // // // // // // // // //         color: '#fff',
// // // // // // // // // //     },
// // // // // // // // // //     distanceText: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         color: '#000',
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //     },
// // // // // // // // // //     loaderContainer: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         backgroundColor: 'rgba(0, 0, 0, 0.7)',
// // // // // // // // // //     },
// // // // // // // // // //     loaderText: {
// // // // // // // // // //         marginTop: 10,
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         color: '#fff',
// // // // // // // // // //     },
// // // // // // // // // //     bottomSheetContent: {
// // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // //     },
// // // // // // // // // //     sheetTitle: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //     },
// // // // // // // // // //     sheetTextInput: {
// // // // // // // // // //         height: 50,
// // // // // // // // // //         backgroundColor: '#f1f1f1',
// // // // // // // // // //         borderRadius: 10,
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // //     },
// // // // // // // // // // });


// // // // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, Modal } from 'react-native';
// // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // import { useDispatch } from 'react-redux';
// // // // // // // // // // // import { setOrigin, setDestination } from '@/app/context/slices/navSlice';

// // // // // // // // // // // const Home_Page = () => {
// // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // //     const [distance, setDistance] = useState<string | null>(null);
// // // // // // // // // // //     const [isLoading, setIsLoading] = useState(false);
// // // // // // // // // // //     const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
// // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // //     const snapPoints = ['25%', '50%', '75%', '80%'];
// // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // // // // //     const cameraRef = useRef<Camera>(null);
// // // // // // // // // // //     const dispatch = useDispatch();

// // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // //     };

// // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // //     };

// // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // //         try {
// // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // //             setDestinationLocation(destinationCoordinates);

// // // // // // // // // // //             if (pickupCoordinates) {
// // // // // // // // // // //                 dispatch(setOrigin(pickupCoordinates));
// // // // // // // // // // //             }
// // // // // // // // // // //             if (destinationCoordinates) {
// // // // // // // // // // //                 dispatch(setDestination(destinationCoordinates));
// // // // // // // // // // //             }
// // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // //         }
// // // // // // // // // // //     };

// // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // //         setIsLoading(true);
// // // // // // // // // // //         setShowFullScreenLoader(true);
// // // // // // // // // // //         try {
// // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number],
// // // // // // // // // // //                 });
// // // // // // // // // // //                 setDirectionCoordinates(directions);

// // // // // // // // // // //                 // Calculate distance
// // // // // // // // // // //                 const calculatedDistance = calculateDistance(pickupLocation, destinationLocation);
// // // // // // // // // // //                 setDistance(calculatedDistance);

// // // // // // // // // // //                 // Trigger camera animation
// // // // // // // // // // //                 if (cameraRef.current) {
// // // // // // // // // // //                     cameraRef.current.flyTo({
// // // // // // // // // // //                         centerCoordinate: [
// // // // // // // // // // //                             (pickupLocation[0] + destinationLocation[0]) / 2,
// // // // // // // // // // //                             (pickupLocation[1] + destinationLocation[1]) / 2,
// // // // // // // // // // //                         ],
// // // // // // // // // // //                         zoomLevel: 12,
// // // // // // // // // // //                         duration: 2000, // animation duration in milliseconds
// // // // // // // // // // //                     });
// // // // // // // // // // //                 }
// // // // // // // // // // //                 handleClosePress();
// // // // // // // // // // //             }
// // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // //         } finally {
// // // // // // // // // // //             setIsLoading(false);
// // // // // // // // // // //             setShowFullScreenLoader(false);
// // // // // // // // // // //         }
// // // // // // // // // // //     };

// // // // // // // // // // //     const calculateDistance = (coords1: number[] | null, coords2: number[] | null) => {
// // // // // // // // // // //         if (!coords1 || !coords2) return 'N/A';
// // // // // // // // // // //         const lat1 = coords1[1];
// // // // // // // // // // //         const lon1 = coords1[0];
// // // // // // // // // // //         const lat2 = coords2[1];
// // // // // // // // // // //         const lon2 = coords2[0];
// // // // // // // // // // //         const R = 6371e3; // meters
// // // // // // // // // // //         const φ1 = (lat1 * Math.PI) / 180;
// // // // // // // // // // //         const φ2 = (lat2 * Math.PI) / 180;
// // // // // // // // // // //         const Δφ = ((lat2 - lat1) * Math.PI) / 180;
// // // // // // // // // // //         const Δλ = ((lon2 - lon1) * Math.PI) / 180;

// // // // // // // // // // //         const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
// // // // // // // // // // //         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// // // // // // // // // // //         const distance = R * c;
// // // // // // // // // // //         return (distance / 1000).toFixed(2) + ' km';
// // // // // // // // // // //     };

// // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // //         []
// // // // // // // // // // //     );

// // // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // // //         router.push('/vehicles');
// // // // // // // // // // //     };

// // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // //         return (
// // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // //         );
// // // // // // // // // // //     }

// // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // //     return (
// // // // // // // // // // //         <>
// // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // //                 {showFullScreenLoader && (
// // // // // // // // // // //                     <Modal transparent={true} animationType="fade">
// // // // // // // // // // //                         <View style={styles.loaderContainer}>
// // // // // // // // // // //                             <ActivityIndicator size="large" color="orange" />
// // // // // // // // // // //                             <Text style={styles.loaderText}>Fetching Directions...</Text>
// // // // // // // // // // //                         </View>
// // // // // // // // // // //                     </Modal>
// // // // // // // // // // //                 )}

// // // // // // // // // // //                 <MapView
// // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/navigation-night-v1"
// // // // // // // // // // //                     zoomEnabled
// // // // // // // // // // //                     rotateEnabled
// // // // // // // // // // //                 >
// // // // // // // // // // //                     <Camera ref={cameraRef} followUserLocation followZoomLevel={15} animationMode="flyTo" />

// // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // //                         visible
// // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // //                         pulsing={{
// // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // //                             color: 'orange',
// // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // //                         }}
// // // // // // // // // // //                     />

// // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // //                             shape={{
// // // // // // // // // // //                                 properties: {},
// // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // //                                 geometry: {
// // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // //                                 },
// // // // // // // // // // //                             }}
// // // // // // // // // // //                         >
// // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // //                                 style={{
// // // // // // // // // // //                                     iconImage: 'mapbox://markers/pickup-pin',
// // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // //                                 }}
// // // // // // // // // // //                             />
// // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // //                     )}

// // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // //                             shape={{
// // // // // // // // // // //                                 properties: {},
// // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // //                                 geometry: {
// // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // //                                 },
// // // // // // // // // // //                             }}
// // // // // // // // // // //                         >
// // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // //                                 style={{
// // // // // // // // // // //                                     iconImage: 'mapbox://markers/destination-pin',
// // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // //                                 }}
// // // // // // // // // // //                             />
// // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // //                     )}

// // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // //                             lineMetrics
// // // // // // // // // // //                             shape={{
// // // // // // // // // // //                                 properties: {},
// // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // //                                 geometry: {
// // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // //                                 },
// // // // // // // // // // //                             }}
// // // // // // // // // // //                         >
// // // // // // // // // // //                             <LineLayer
// // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // //                                 style={{
// // // // // // // // // // //                                     lineColor: 'blue',
// // // // // // // // // // //                                     lineWidth: 5,
// // // // // // // // // // //                                     lineOpacity: 0.6,
// // // // // // // // // // //                                 }}
// // // // // // // // // // //                             />
// // // // // // // // // // //                             <LineLayer
// // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // //                                 style={{
// // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // //                                     lineWidth: 7,
// // // // // // // // // // //                                     lineDasharray: [1, 3],
// // // // // // // // // // //                                     // Removed zoom expressions and use a static color
// // // // // // // // // // //                                     lineGradient: 'yellow',
// // // // // // // // // // //                                 }}
// // // // // // // // // // //                             />
// // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // //                     )}
// // // // // // // // // // //                 </MapView>

// // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // //                     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // // //                         <Text style={styles.buttonText}>Enter Locations</Text>
// // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // //                     {distance && (
// // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={navigateToNextScreen}>
// // // // // // // // // // //                             <Text style={styles.distanceText}>Distance: {distance}</Text>
// // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // //                     )}
// // // // // // // // // // //                 </View>

// // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // //                     index={0}
// // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // //                     enablePanDownToClose
// // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // //                 >
// // // // // // // // // // //                     <View style={styles.bottomSheetContent}>
// // // // // // // // // // //                         <Text style={styles.sheetTitle}>Enter Locations</Text>
// // // // // // // // // // //                         <BottomSheetTextInput
// // // // // // // // // // //                             style={styles.sheetTextInput}
// // // // // // // // // // //                             placeholder="Pickup Location"
// // // // // // // // // // //                             value={from}
// // // // // // // // // // //                             onChangeText={setFrom}
// // // // // // // // // // //                         />
// // // // // // // // // // //                         <BottomSheetTextInput
// // // // // // // // // // //                             style={styles.sheetTextInput}
// // // // // // // // // // //                             placeholder="Destination Location"
// // // // // // // // // // //                             value={to}
// // // // // // // // // // //                             onChangeText={setTo}
// // // // // // // // // // //                         />
// // // // // // // // // // //                         <TouchableOpacity style={styles.submitButton} onPress={handleOnPressContinue}>
// // // // // // // // // // //                             {isLoading ? (
// // // // // // // // // // //                                 <ActivityIndicator color="white" />
// // // // // // // // // // //                             ) : (
// // // // // // // // // // //                                 <Text style={styles.submitButtonText}>Continue</Text>
// // // // // // // // // // //                             )}
// // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // //                     </View>
// // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // //             </View>
// // // // // // // // // // //         </>
// // // // // // // // // // //     );
// // // // // // // // // // // };

// // // // // // // // // // // export default Home_Page;

// // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // //     container: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //     },
// // // // // // // // // // //     map: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //     },
// // // // // // // // // // //     errorContainer: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     errorText: {
// // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // //         color: 'red',
// // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // //         padding: 16,
// // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // //         bottom: 0,
// // // // // // // // // // //         width: '100%',
// // // // // // // // // // //     },
// // // // // // // // // // //     enterLocationButton: {
// // // // // // // // // // //         backgroundColor: Colors.primary,
// // // // // // // // // // //         padding: 12,
// // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         marginRight: 8,
// // // // // // // // // // //     },
// // // // // // // // // // //     continueButton: {
// // // // // // // // // // //         backgroundColor: 'orange',
// // // // // // // // // // //         padding: 12,
// // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     buttonText: {
// // // // // // // // // // //         color: 'white',
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     distanceText: {
// // // // // // // // // // //         color: 'white',
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //     },
// // // // // // // // // // //     bottomSheetContent: {
// // // // // // // // // // //         padding: 16,
// // // // // // // // // // //         backgroundColor: 'white',
// // // // // // // // // // //         height: '100%',
// // // // // // // // // // //     },
// // // // // // // // // // //     sheetTitle: {
// // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         marginBottom: 16,
// // // // // // // // // // //     },
// // // // // // // // // // //     sheetTextInput: {
// // // // // // // // // // //         borderColor: '#cccccc',
// // // // // // // // // // //         borderWidth: 1,
// // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // //         padding: 10,
// // // // // // // // // // //         marginBottom: 16,
// // // // // // // // // // //         backgroundColor: '#f9f9f9',
// // // // // // // // // // //     },
// // // // // // // // // // //     submitButton: {
// // // // // // // // // // //         backgroundColor: Colors.primary,
// // // // // // // // // // //         padding: 12,
// // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     submitButtonText: {
// // // // // // // // // // //         color: 'white',
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //     },
// // // // // // // // // // //     loaderContainer: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // // // // // // // // //     },
// // // // // // // // // // //     loaderText: {
// // // // // // // // // // //         marginTop: 10,
// // // // // // // // // // //         color: 'white',
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //     },
// // // // // // // // // // // });



// // // // // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
// // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // import { AntDesign, Feather } from '@expo/vector-icons';
// // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // import FlyTo from '@/components/FlyTo';
// // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // import { useDispatch, useSelector } from 'react-redux';
// // // // // // // // // // // // import { selectOrigin, setOrigin, setDestination } from '@/app/context/slices/navSlice';
// // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';

// // // // // // // // // // // // const Home_Page = () => {
// // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // //     const [isLoading, setIsLoading] = useState(false);
// // // // // // // // // // // //     const [originSet, setOriginSet] = useState(false);
// // // // // // // // // // // //     const [destinationSet, setDestinationSet] = useState(false);

// // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // //     const snapPoints = ['25%', '50%', '75%', '80%'];
// // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // // // // // //     const cameraRef = useRef<Camera>(null);

// // // // // // // // // // // //     // Define refs for BottomSheetTextInput
// // // // // // // // // // // //     const pickupInputRef = useRef<any>(null);
// // // // // // // // // // // //     const destinationInputRef = useRef<any>(null);

// // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // //         setter(text);
// // // // // // // // // // // //         // console.log("From:", from, "To:", to); // Log the user input
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // //         try {
// // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // //             console.log(from, to)
// // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // //             setOriginSet(!!pickupCoordinates);
// // // // // // // // // // // //             setDestinationSet(!!destinationCoordinates);
// // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // //         }
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // //         setIsLoading(true); // Start loading state
// // // // // // // // // // // //         try {
// // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number],
// // // // // // // // // // // //                 });
// // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // //                 handleClosePress(); // Close the bottom sheet
// // // // // // // // // // // //             }
// // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // //         } finally {
// // // // // // // // // // // //             handleClosePress()
// // // // // // // // // // // //             setIsLoading(false); // End loading state
// // // // // // // // // // // //         }
// // // // // // // // // // // //     };

// // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // //         if (originSet && destinationSet && cameraRef.current && pickupLocation && destinationLocation) {
// // // // // // // // // // // //             const bbox = [
// // // // // // // // // // // //                 [Math.min(pickupLocation[0], destinationLocation[0]), Math.min(pickupLocation[1], destinationLocation[1])],
// // // // // // // // // // // //                 [Math.max(pickupLocation[0], destinationLocation[0]), Math.max(pickupLocation[1], destinationLocation[1])]
// // // // // // // // // // // //             ];
// // // // // // // // // // // //             cameraRef.current.fitBounds(bbox[0], bbox[1], 100, 200);
// // // // // // // // // // // //         }
// // // // // // // // // // // //     }, [pickupLocation, destinationLocation]);

// // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // //         []
// // // // // // // // // // // //     );

// // // // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // // // //         router.push('/vehicles');
// // // // // // // // // // // //     };

// // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // //         return (
// // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // //         );
// // // // // // // // // // // //     }

// // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // //     const dispatch = useDispatch();
// // // // // // // // // // // //     const origin = useSelector(selectOrigin);

// // // // // // // // // // // //     return (
// // // // // // // // // // // //         <>
// // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // //                 <MapView
// // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/navigation-night-v1"
// // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // //                     rotateEnabled={true}
// // // // // // // // // // // //                 >
// // // // // // // // // // // //                     <Camera ref={cameraRef} followUserLocation followZoomLevel={15} animationMode="easeTo" />
// // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // //                             color: 'orange',
// // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // //                         }}
// // // // // // // // // // // //                     />

// // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // //                             shape={{
// // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // //                                 },
// // // // // // // // // // // //                             }}
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // //                                 style={{
// // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // //                                 }}
// // // // // // // // // // // //                             />
// // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // //                     )}

// // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // //                             shape={{
// // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // //                                 },
// // // // // // // // // // // //                             }}
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // //                                 style={{
// // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // //                                 }}
// // // // // // // // // // // //                             />
// // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // //                     )}

// // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // //                             shape={{
// // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // //                                 },
// // // // // // // // // // // //                             }}
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // //                                 style={{
// // // // // // // // // // // //                                     lineColor: 'red',
// // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // //                                 }}
// // // // // // // // // // // //                             />
// // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // //                                 style={{
// // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // //                                     lineWidth: 7,
// // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // //                                 }}
// // // // // // // // // // // //                             />
// // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // //                     )}

// // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // //                         <>
// // // // // // // // // // // //                             <FlyTo flyToCoordinates={destinationLocation} flyToZoomLevel={16} />
// // // // // // // // // // // //                             <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // //                         </>
// // // // // // // // // // // //                     )}
// // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // //                         <>
// // // // // // // // // // // //                             <FlyTo flyToCoordinates={pickupLocation} flyToZoomLevel={16} />
// // // // // // // // // // // //                             <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // //                         </>
// // // // // // // // // // // //                     )}
// // // // // // // // // // // //                 </MapView>

// // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // //                     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // // // //                         <Text style={styles.buttonText}>Enter Location</Text>
// // // // // // // // // // // //                     </TouchableOpacity>

// // // // // // // // // // // //                     <TouchableOpacity
// // // // // // // // // // // //                         style={[styles.continueButton, { opacity: originSet && destinationSet ? 1 : 0.5 }]}
// // // // // // // // // // // //                         disabled={!originSet || !destinationSet}
// // // // // // // // // // // //                         onPress={navigateToNextScreen}
// // // // // // // // // // // //                     >
// // // // // // // // // // // //                         <Text style={styles.buttonText}>Continue</Text>
// // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // //                 </View>

// // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // //                     index={0}
// // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // //                 >
// // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // //                         </View>
// // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // //                             />
// // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // //                                 placeholder="Destination Location"
// // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // //                             />
// // // // // // // // // // // //                         </View>
// // // // // // // // // // // //                         <TouchableOpacity
// // // // // // // // // // // //                             style={styles.continueButton}
// // // // // // // // // // // //                             onPress={handleOnPressContinue}
// // // // // // // // // // // //                             disabled={isLoading}
// // // // // // // // // // // //                         >
// // // // // // // // // // // //                             {isLoading ? (
// // // // // // // // // // // //                                 <ActivityIndicator size="small" color="#fff" />
// // // // // // // // // // // //                             ) : (
// // // // // // // // // // // //                                 <Text style={styles.buttonText}>Get Directions</Text>
// // // // // // // // // // // //                             )}
// // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // //                     </View>
// // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // //             </View>
// // // // // // // // // // // //         </>
// // // // // // // // // // // //     );
// // // // // // // // // // // // };

// // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // //     container: {
// // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     map: {
// // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // //         left: 20,
// // // // // // // // // // // //         right: 20,
// // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // //         marginHorizontal: 10,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     enterLocationButton: {
// // // // // // // // // // // //         backgroundColor: Colors.primary,
// // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //         justifyContent: 'center'
// // // // // // // // // // // //     },
// // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // //         backgroundColor: '#0ada3e',
// // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //         justifyContent: 'center'
// // // // // // // // // // // //     },
// // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // //         color: 'white',
// // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // //         fontWeight: 'bold'
// // // // // // // // // // // //     },
// // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     errorText: {
// // // // // // // // // // // //         color: 'red',
// // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     headerText: {
// // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // //         marginTop: 15,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     input: {
// // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // //         borderWidth: 1,
// // // // // // // // // // // //         borderColor: '#ddd',
// // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // //     },
// // // // // // // // // // // // });

// // // // // // // // // // // // export default Home_Page;


// // // // // // // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign, Feather } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // // // import FlyTo from '@/components/FlyTo';
// // // // // // // // // // // // // // import { useDispatch, useSelector } from 'react-redux';
// // // // // // // // // // // // // // import { selectOrigin } from '@/app/context/slices/navSlice';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [originSet, setOriginSet] = useState(false);
// // // // // // // // // // // // // //     const [destinationSet, setDestinationSet] = useState(false);
// // // // // // // // // // // // // //     const [isLoading, setIsLoading] = useState(true);

// // // // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // // // //     const snapPoints = ['25%', '50%', '75%', '90%'];
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // // // // // // // //     const cameraRef = useRef<Camera>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //             setOriginSet(!!pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationSet(!!destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 bottomSheetRef.current?.close(); // Collapse bottom sheet
// // // // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number],
// // // // // // // // // // // // // //                 });
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //                 setIsLoading(false);
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // //         if (originSet && destinationSet && cameraRef.current && pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //             const bbox = [
// // // // // // // // // // // // // //                 [Math.min(pickupLocation[0], destinationLocation[0]), Math.min(pickupLocation[1], destinationLocation[1])], // Min coordinates
// // // // // // // // // // // // // //                 [Math.max(pickupLocation[0], destinationLocation[0]), Math.max(pickupLocation[1], destinationLocation[1])]  // Max coordinates
// // // // // // // // // // // // // //             ];
// // // // // // // // // // // // // //             cameraRef.current.fitBounds(bbox[0], bbox[1], 100, 200);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     }, [pickupLocation, destinationLocation]);

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // // // // // //         router.push('/vehicles');
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);
// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/navigation-night-v1"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={true}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera ref={cameraRef} followUserLocation followZoomLevel={15} animationMode="easeTo" />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'orange',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'red',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 7,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                             <FlyTo flyToCoordinates={destinationLocation} flyToZoomLevel={16} />
// // // // // // // // // // // // // //                             <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                             <FlyTo flyToCoordinates={pickupLocation} flyToZoomLevel={16} />
// // // // // // // // // // // // // //                             <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>

// // // // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // // // //                     {/* Enter Location Button */}
// // // // // // // // // // // // // //                     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                         <Text style={styles.buttonText}>Enter Location</Text>
// // // // // // // // // // // // // //                     </TouchableOpacity>

// // // // // // // // // // // // // //                     {/* Continue Button */}
// // // // // // // // // // // // // //                     <TouchableOpacity
// // // // // // // // // // // // // //                         style={[styles.continueButton, { opacity: originSet && destinationSet ? 1 : 0.5 }]}
// // // // // // // // // // // // // //                         disabled={!originSet || !destinationSet}
// // // // // // // // // // // // // //                         onPress={navigateToNextScreen}
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                         <Text style={styles.buttonText}>Continue</Text>
// // // // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // //                 </View>

// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText}>Get Directions</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 60,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     enterLocationButton: {
// // // // // // // // // // // // // //         backgroundColor: 'blue',
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: 'green',
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: 'white',
// // // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         borderWidth: 1,
// // // // // // // // // // // // // //         borderColor: '#ccc',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //         backgroundColor: '#f9f9f9',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // // //         color: '#ff0000',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });

// // // // // // // // // // // // // // export default HomePage;



// // // // // // // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign, Feather } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // // // import FlyTo from '@/components/FlyTo';
// // // // // // // // // // // // // // import { MaterialIcons } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
// // // // // // // // // // // // // // import { useDispatch, useSelector } from 'react-redux';
// // // // // // // // // // // // // // import { selectOrigin } from '@/app/context/slices/navSlice';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<string[]>([]);
// // // // // // // // // // // // // //     const [originSet, setOriginSet] = useState(false);
// // // // // // // // // // // // // //     const [destinationSet, setDestinationSet] = useState(false);

// // // // // // // // // // // // // //     const [isLoading, setIsLoading] = useState(true);


// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const snapPoints = ['25%', '50%', '75%', '90%'];
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);
// // // // // // // // // // // // // //     const cameraRef = useRef<Camera>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<any>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<any>(null);

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //         // You can add debouncing logic here to fetch suggestions
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //             setOriginSet(!!pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationSet(!!destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async (event: any) => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 bottomSheetRef.current?.close(); // Collapse bottom sheet
// // // // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number],
// // // // // // // // // // // // // //                 });
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //                 setIsLoading(false);
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // //         if (originSet && destinationSet && cameraRef.current && pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //             const coordinates = [pickupLocation, destinationLocation];
// // // // // // // // // // // // // //             const bbox = [
// // // // // // // // // // // // // //                 [Math.min(pickupLocation[0], destinationLocation[0]), Math.min(pickupLocation[1], destinationLocation[1])], // Min coordinates
// // // // // // // // // // // // // //                 [Math.max(pickupLocation[0], destinationLocation[0]), Math.max(pickupLocation[1], destinationLocation[1])]  // Max coordinates
// // // // // // // // // // // // // //             ];
// // // // // // // // // // // // // //             cameraRef.current.fitBounds(bbox[0], bbox[1], 100, 200);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //         if (!pickupLocation || !destinationLocation) return;
// // // // // // // // // // // // // //     }, [pickupLocation, destinationLocation]);

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // // // // // //         router.push('/vehicles');
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     // console.log(pickupLocation, destinationLocation)
// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     const dispatch = useDispatch();
// // // // // // // // // // // // // //     const origin = useSelector(selectOrigin)

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/navigation-night-v1"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={true}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera ref={cameraRef} followUserLocation followZoomLevel={15} animationMode="easeTo" />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'orange',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'red',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 7,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                             <FlyTo flyToCoordinates={destinationLocation} flyToZoomLevel={16} />
// // // // // // // // // // // // // //                             <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                             <FlyTo flyToCoordinates={pickupLocation} flyToZoomLevel={16} />
// // // // // // // // // // // // // //                             <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>

// // // // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // // // //                     {/* Enter Location Button */}
// // // // // // // // // // // // // //                     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                         <Text style={styles.buttonText}>Enter Location</Text>
// // // // // // // // // // // // // //                     </TouchableOpacity>

// // // // // // // // // // // // // //                     {/* Continue Button */}
// // // // // // // // // // // // // //                     <TouchableOpacity
// // // // // // // // // // // // // //                         style={[styles.continueButton, { opacity: originSet && destinationSet ? 1 : 0.5 }]}
// // // // // // // // // // // // // //                         disabled={!originSet || !destinationSet}
// // // // // // // // // // // // // //                         onPress={navigateToNextScreen}
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                         <Text style={styles.buttonText}>Continue</Text>
// // // // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // //                 </View>

// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText}>Get Directions</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         left: 20,
// // // // // // // // // // // // // //         right: 20,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         marginHorizontal: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     enterLocationButton: {
// // // // // // // // // // // // // //         backgroundColor: Colors.primary,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center'
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#0ada3e',
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center'
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: 'white',
// // // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // // //         fontWeight: 'bold'
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         color: 'red',
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginTop: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //         borderWidth: 1,
// // // // // // // // // // // // // //         borderColor: '#ddd',
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });

// // // // // // // // // // // // // // export default HomePage;



// // // // // // // // // // // // // // import React, { useCallback, useEffect, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // // // import FlyTo from '@/components/FlyTo';
// // // // // // // // // // // // // // import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
// // // // // // // // // // // // // // import { Feather } from '@expo/vector-icons';

// // // // // // // // // // // // // // interface FlyToProps {
// // // // // // // // // // // // // //     flyToCoordinates: number[]; // Coordinates to fly the map to
// // // // // // // // // // // // // //     flyToZoomLevel: number; // Zoom level to apply when flying
// // // // // // // // // // // // // // }

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<string[]>([]);
// // // // // // // // // // // // // //     const [originSet, setOriginSet] = useState(false);
// // // // // // // // // // // // // //     const [destinationSet, setDestinationSet] = useState(false);

// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const snapPoints = ['25%', '50%', '75%', '90%'];
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //         // You can add debouncing logic here to fetch suggestions
// // // // // // // // // // // // // //     };


// // // // // // // // // // // // // //     console.log('my current location: ', )
// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //             setOriginSet(!!pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationSet(!!destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async (event: OnPressEvent) => {
// // // // // // // // // // // // // //         // console.log(event)
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 bottomSheetRef.current?.close();// Collapse bottom sheet
// // // // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number]
// // // // // // // // // // // // // //                 });
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // //         if (originSet && destinationSet) {
// // // // // // // // // // // // // //             fetchCoordinates();
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     },[pickupLocation, destinationLocation, directionCoordinates])

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // // // // // //         // Implement navigation to next screen here
// // // // // // // // // // // // // //         router.push('/vehicles')
// // // // // // // // // // // // // //         // console.log('Navigate to next screen');
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);


// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/navigation-night-v1"
// // // // // // // // // // // // // //                     // styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={15} animationMode={'easeTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 properties: {},
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'red',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 7,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                         <FlyTo flyToCoordinates={destinationLocation} flyToZoomLevel={16} />
// // // // // // // // // // // // // //                         <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // // // //                         </>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <>
// // // // // // // // // // // // // //                         <FlyTo flyToCoordinates={pickupLocation} flyToZoomLevel={16} />
// // // // // // // // // // // // // //                         <Feather name="map-pin" size={24} color="pink" />
// // // // // // // // // // // // // //                         </>

// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>


// // // // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // // // //                     {/* Enter Location Button */}
// // // // // // // // // // // // // //                     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                         <Text style={styles.buttonText}>Enter Location</Text>
// // // // // // // // // // // // // //                         {/* <AntDesign name="arrowright" size={24} color="white" /> */}
// // // // // // // // // // // // // //                     </TouchableOpacity>

// // // // // // // // // // // // // //                     {/* Continue Button */}
// // // // // // // // // // // // // //                     <TouchableOpacity
// // // // // // // // // // // // // //                         style={[styles.continueButton, { opacity: originSet && destinationSet ? 1 : 0.5 }]}
// // // // // // // // // // // // // //                         disabled={!originSet || !destinationSet}
// // // // // // // // // // // // // //                         onPress={navigateToNextScreen}
// // // // // // // // // // // // // //                     >
// // // // // // // // // // // // // //                         <Text style={styles.buttonText}>Continue</Text>
// // // // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // //                 </View>

// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             {suggestions.length > 0 && (
// // // // // // // // // // // // // //                                 <View style={styles.suggestionsContainer}>
// // // // // // // // // // // // // //                                     {suggestions.map((suggestion, index) => (
// // // // // // // // // // // // // //                                         <TouchableOpacity
// // // // // // // // // // // // // //                                             key={index}
// // // // // // // // // // // // // //                                             style={styles.suggestionItem}
// // // // // // // // // // // // // //                                             onPress={() => {
// // // // // // // // // // // // // //                                                 setFrom(suggestion);
// // // // // // // // // // // // // //                                                 setSuggestions([]);
// // // // // // // // // // // // // //                                             }}
// // // // // // // // // // // // // //                                         >
// // // // // // // // // // // // // //                                             <Text>{suggestion}</Text>
// // // // // // // // // // // // // //                                         </TouchableOpacity>
// // // // // // // // // // // // // //                                     ))}
// // // // // // // // // // // // // //                                 </View>
// // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         left: 20,
// // // // // // // // // // // // // //         right: 20,
// // // // // // // // // // // // // //         paddingHorizontal: 10, // Adjust this to increase/decrease gap between buttons
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     enterLocationButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: 'yellow',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionsContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#e0e0e0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // //         maxHeight: 150,
// // // // // // // // // // // // // //         overflow: 'scroll',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionItem: {
// // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // //         borderBottomWidth: 1,
// // // // // // // // // // // // // //         borderBottomColor: '#ccc',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#FF6347',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });


// // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign, Entypo } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<string[]>([]);
// // // // // // // // // // // // // //     const [originSet, setOriginSet] = useState(false);
// // // // // // // // // // // // // //     const [destinationSet, setDestinationSet] = useState(false);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //         // You can add debouncing logic here to fetch suggestions
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //             setOriginSet(!!pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationSet(!!destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number]
// // // // // // // // // // // // // //                 });
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //                 bottomSheetRef.current?.close(); // Collapse bottom sheet
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     const navigateToNextScreen = () => {
// // // // // // // // // // // // // //         // Implement navigation to next screen here
// // // // // // // // // // // // // //         console.log('Navigate to next screen');
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={10} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'red',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>

// // // // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // // // //     {/* Enter Location Button */}
// // // // // // // // // // // // // //     <TouchableOpacity style={styles.enterLocationButton} onPress={handleOpenPress}>
// // // // // // // // // // // // // //         <Text style={styles.buttonText}>Enter Location</Text>
// // // // // // // // // // // // // //         <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //     </TouchableOpacity>

// // // // // // // // // // // // // //     {/* Continue Button */}
// // // // // // // // // // // // // //     <TouchableOpacity
// // // // // // // // // // // // // //         style={[styles.continueButton, { opacity: originSet && destinationSet ? 1 : 0.5 }]}
// // // // // // // // // // // // // //         disabled={!originSet || !destinationSet}
// // // // // // // // // // // // // //         onPress={navigateToNextScreen}
// // // // // // // // // // // // // //     >
// // // // // // // // // // // // // //         <Text style={styles.buttonText}>Continue</Text>
// // // // // // // // // // // // // //         <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //     </TouchableOpacity>
// // // // // // // // // // // // // // </View>




// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             {suggestions.length > 0 && (
// // // // // // // // // // // // // //                                 <View style={styles.suggestionsContainer}>
// // // // // // // // // // // // // //                                     {suggestions.map((suggestion, index) => (
// // // // // // // // // // // // // //                                         <TouchableOpacity
// // // // // // // // // // // // // //                                             key={index}
// // // // // // // // // // // // // //                                             style={styles.suggestionItem}
// // // // // // // // // // // // // //                                             onPress={() => {
// // // // // // // // // // // // // //                                                 setFrom(suggestion);
// // // // // // // // // // // // // //                                                 setSuggestions([]);
// // // // // // // // // // // // // //                                             }}
// // // // // // // // // // // // // //                                         >
// // // // // // // // // // // // // //                                             <Text>{suggestion}</Text>
// // // // // // // // // // // // // //                                         </TouchableOpacity>
// // // // // // // // // // // // // //                                     ))}
// // // // // // // // // // // // // //                                 </View>
// // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionsContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#e0e0e0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         maxHeight: 150,
// // // // // // // // // // // // // //         overflow: 'scroll',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionItem: {
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         borderBottomWidth: 1,
// // // // // // // // // // // // // //         borderBottomColor: '#ccc',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#FF6347',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         // alignItems: 'center',
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         gap: 10
// // // // // // // // // // // // // //         // right: 30,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     enterLocationButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });



// // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// // // // // // // // // // // // // // import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
// // // // // // // // // // // // // // import { Entypo } from '@expo/vector-icons';


// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<string[]>([]);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //         // You can add debouncing logic here to fetch suggestions
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number]
// // // // // // // // // // // // // //                 });
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //                 bottomSheetRef.current?.close(); // Collapse bottom sheet
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={10} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'red',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <View style={{ flexDirection: 'row', }}>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Enter Location</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Continue</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             {suggestions.length > 0 && (
// // // // // // // // // // // // // //                                 <View style={styles.suggestionsContainer}>
// // // // // // // // // // // // // //                                     {suggestions.map((suggestion, index) => (
// // // // // // // // // // // // // //                                         <TouchableOpacity
// // // // // // // // // // // // // //                                             key={index}
// // // // // // // // // // // // // //                                             style={styles.suggestionItem}
// // // // // // // // // // // // // //                                             onPress={() => {
// // // // // // // // // // // // // //                                                 setFrom(suggestion);
// // // // // // // // // // // // // //                                                 setSuggestions([]);
// // // // // // // // // // // // // //                                             }}
// // // // // // // // // // // // // //                                         >
// // // // // // // // // // // // // //                                             <Text>{suggestion}</Text>
// // // // // // // // // // // // // //                                         </TouchableOpacity>
// // // // // // // // // // // // // //                                     ))}
// // // // // // // // // // // // // //                                 </View>
// // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionsContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#e0e0e0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         maxHeight: 150,
// // // // // // // // // // // // // //         overflow: 'scroll',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionItem: {
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         borderBottomWidth: 1,
// // // // // // // // // // // // // //         borderBottomColor: '#ccc',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#FF6347',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });



// // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// // // // // // // // // // // // // // import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<string[]>([]);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //         // You can add debouncing logic here to fetch suggestions
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 const directions = await getDirections({
// // // // // // // // // // // // // //                     pickupCoordinates: pickupLocation as [number, number],
// // // // // // // // // // // // // //                     destinationCoordinates: destinationLocation as [number, number]
// // // // // // // // // // // // // //                 });
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     // Logging for debugging
// // // // // // // // // // // // // //     console.log('from:', from);
// // // // // // // // // // // // // //     console.log('to:', to);
// // // // // // // // // // // // // //     console.log('pickupLocation:', pickupLocation);
// // // // // // // // // // // // // //     console.log('destinationLocation:', destinationLocation);
// // // // // // // // // // // // // //     console.log('directionCoordinates:', directionCoordinates);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             {suggestions.length > 0 && (
// // // // // // // // // // // // // //                                 <View style={styles.suggestionsContainer}>
// // // // // // // // // // // // // //                                     {suggestions.map((suggestion, index) => (
// // // // // // // // // // // // // //                                         <TouchableOpacity
// // // // // // // // // // // // // //                                             key={index}
// // // // // // // // // // // // // //                                             style={styles.suggestionItem}
// // // // // // // // // // // // // //                                             onPress={() => {
// // // // // // // // // // // // // //                                                 setFrom(suggestion);
// // // // // // // // // // // // // //                                                 setSuggestions([]);
// // // // // // // // // // // // // //                                             }}
// // // // // // // // // // // // // //                                         >
// // // // // // // // // // // // // //                                             <Text>{suggestion}</Text>
// // // // // // // // // // // // // //                                         </TouchableOpacity>
// // // // // // // // // // // // // //                                     ))}
// // // // // // // // // // // // // //                                 </View>
// // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionsContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#e0e0e0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         maxHeight: 150,
// // // // // // // // // // // // // //         overflow: 'scroll',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionItem: {
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         borderBottomWidth: 1,
// // // // // // // // // // // // // //         borderBottomColor: '#ccc',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#FF6347',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });




// // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// // // // // // // // // // // // // // import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<string[]>([]);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setter(text);
// // // // // // // // // // // // // //         // You can add debouncing logic here to fetch suggestions
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const fetchCoordinates = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
// // // // // // // // // // // // // //             setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //             setDestinationLocation(destinationCoordinates);
// // // // // // // // // // // // // //         } catch (error: any) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching coordinates', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             await fetchCoordinates();
// // // // // // // // // // // // // //             if (pickupLocation && destinationLocation) {
// // // // // // // // // // // // // //                 const directions = await getDirections(pickupLocation, destinationLocation);
// // // // // // // // // // // // // //                 setDirectionCoordinates(directions);
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             Alert.alert('Error fetching directions', error.message);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             {suggestions.length > 0 && (
// // // // // // // // // // // // // //                                 <View style={styles.suggestionsContainer}>
// // // // // // // // // // // // // //                                     {suggestions.map((suggestion, index) => (
// // // // // // // // // // // // // //                                         <TouchableOpacity
// // // // // // // // // // // // // //                                             key={index}
// // // // // // // // // // // // // //                                             style={styles.suggestionItem}
// // // // // // // // // // // // // //                                             onPress={() => {
// // // // // // // // // // // // // //                                                 setFrom(suggestion);
// // // // // // // // // // // // // //                                                 setSuggestions([]);
// // // // // // // // // // // // // //                                             }}
// // // // // // // // // // // // // //                                         >
// // // // // // // // // // // // // //                                             <Text>{suggestion}</Text>
// // // // // // // // // // // // // //                                         </TouchableOpacity>
// // // // // // // // // // // // // //                                     ))}
// // // // // // // // // // // // // //                                 </View>
// // // // // // // // // // // // // //                             )}
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#f0f0f0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionsContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#e0e0e0',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         maxHeight: 150,
// // // // // // // // // // // // // //         overflow: 'scroll',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     suggestionItem: {
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         borderBottomWidth: 1,
// // // // // // // // // // // // // //         borderBottomColor: '#ccc',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#FF6347',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });



// // // // // // // // // // // // // // import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { Search } from '@/services/Origin';
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const [from, setFrom] = useState<number[]>([]);
// // // // // // // // // // // // // //     const [to, setTo] = useState<number[]>([]);

// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<any[]>([])

// // // // // // // // // // // // // //     const fetchLocationSuggestions = async (from: string) => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //           const suggestions = await geoCoding(from);
// // // // // // // // // // // // // //           setSuggestions(suggestions);
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //           console.error('Error fetching location suggestions:', error);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //       }

// // // // // // // // // // // // // //     // const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     // const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<any>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<any>(null);

// // // // // // // // // // // // // //     // const fetchLocationSuggestions = async (query: string) => {
// // // // // // // // // // // // // //     //     try {
// // // // // // // // // // // // // //     //         const suggestions = await Search(query);
// // // // // // // // // // // // // //     //         setSuggestions(suggestions);
// // // // // // // // // // // // // //     //     } catch (error) {
// // // // // // // // // // // // // //     //         console.error('Error fetching location suggestions:', error);
// // // // // // // // // // // // // //     //     }
// // // // // // // // // // // // // //     // };

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setInput(text);
// // // // // // // // // // // // // //         if (text.length > 2) {
// // // // // // // // // // // // // //             fetchLocationSuggestions(text);
// // // // // // // // // // // // // //         } else {
// // // // // // // // // // // // // //             setSuggestions([]);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         if (!from || !to) {
// // // // // // // // // // // // // //             Alert.alert('Error', 'Please fill in both pickup and destination locations');
// // // // // // // // // // // // // //             return;
// // // // // // // // // // // // // //         }

// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const pickupCoordinates = await geoCoding(from: any);
// // // // // // // // // // // // // //             const destinationCoordinates = await geoCoding(to: any);

// // // // // // // // // // // // // //             if (pickupCoordinates && destinationCoordinates) {
// // // // // // // // // // // // // //                 setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //                 setDestinationLocation(destinationCoordinates);

// // // // // // // // // // // // // //                 const directions = await getDirections({ pickupCoordinates, destinationCoordinates });
// // // // // // // // // // // // // //                 if (directions) {
// // // // // // // // // // // // // //                     setDirectionCoordinates(directions);
// // // // // // // // // // // // // //                     bottomSheetRef.current?.close(); // Close the bottom sheet
// // // // // // // // // // // // // //                     // animateCameraToRoute(pickupCoordinates, destinationCoordinates);
// // // // // // // // // // // // // //                 } else {
// // // // // // // // // // // // // //                     throw new Error('No route coordinates found');
// // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // //             } else {
// // // // // // // // // // // // // //                 throw new Error('Failed to fetch coordinates for pickup or destination');
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             console.error('Error fetching directions:', error);
// // // // // // // // // // // // // //             Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => (
// // // // // // // // // // // // // //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// // // // // // // // // // // // // //         ),
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     // const animateCameraToRoute = (pickupCoordinates: number[], destinationCoordinates: number[]) => {
// // // // // // // // // // // // // //     //     if (pickupCoordinates && destinationCoordinates) {
// // // // // // // // // // // // // //     //         mapViewRef.current?.setCamera({
// // // // // // // // // // // // // //     //             centerCoordinate: [
// // // // // // // // // // // // // //     //                 (pickupCoordinates[0] + destinationCoordinates[0]) / 2,
// // // // // // // // // // // // // //     //                 (pickupCoordinates[1] + destinationCoordinates[1]) / 2
// // // // // // // // // // // // // //     //             ],
// // // // // // // // // // // // // //     //             zoomLevel: 12,
// // // // // // // // // // // // // //     //             animationDuration: 2000 // Animation duration in milliseconds
// // // // // // // // // // // // // //     //         });
// // // // // // // // // // // // // //     //     }
// // // // // // // // // // // // // //     // };

// // // // // // // // // // // // // //     const mapViewRef = useRef<MapView>(null);

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView
// // // // // // // // // // // // // //                     ref={mapViewRef}
// // // // // // // // // // // // // //                     style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {pickupLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="pickupSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: pickupLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="pickupSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {destinationLocation && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="destinationSource"
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'Point',
// // // // // // // // // // // // // //                                     coordinates: destinationLocation,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <SymbolLayer
// // // // // // // // // // // // // //                                 id="destinationSymbol"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     iconImage: 'marker-15',
// // // // // // // // // // // // // //                                     iconSize: 1.5,
// // // // // // // // // // // // // //                                     iconOffset: [0, -15],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}
// // // // // // // // // // // // // //                         >
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text: string) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}smartInsertDelete
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 onChangeText={(text: string) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         borderRadius: 20,
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         color: '#333',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // //         elevation: 2,
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         color: '#ff0000',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });



// // // // // // // // // // // // // // import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { Search } from '@/services/Origin';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
// // // // // // // // // // // // // //     const [suggestions, setSuggestions] = useState<any[]>([]);
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const fetchLocationSuggestions = async (query: string) => {
// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const suggestions = await Search(query);
// // // // // // // // // // // // // //             setSuggestions(suggestions);
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             console.error('Error fetching location suggestions:', error);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleInputChange = (text: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
// // // // // // // // // // // // // //         setInput(text);
// // // // // // // // // // // // // //         if (text.length > 2) {
// // // // // // // // // // // // // //             fetchLocationSuggestions(text);
// // // // // // // // // // // // // //         } else {
// // // // // // // // // // // // // //             setSuggestions([]);
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         if (!from || !to) {
// // // // // // // // // // // // // //             Alert.alert('Error', 'Please fill in both pickup and destination locations');
// // // // // // // // // // // // // //             return;
// // // // // // // // // // // // // //         }

// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const pickupCoordinates = await geoCoding(from);
// // // // // // // // // // // // // //             const destinationCoordinates = await geoCoding(to);

// // // // // // // // // // // // // //             if (pickupCoordinates && destinationCoordinates) {
// // // // // // // // // // // // // //                 setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //                 setDestinationLocation(destinationCoordinates);

// // // // // // // // // // // // // //                 const directions = await getDirections({ pickupCoordinates, destinationCoordinates });
// // // // // // // // // // // // // //                 if (directions) {
// // // // // // // // // // // // // //                     setDirectionCoordinates(directions);
// // // // // // // // // // // // // //                     router.push('/vehicles');
// // // // // // // // // // // // // //                 } else {
// // // // // // // // // // // // // //                     throw new Error('No route coordinates found');
// // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // //             } else {
// // // // // // // // // // // // // //                 throw new Error('Failed to fetch coordinates for pickup or destination');
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             console.error('Error fetching directions:', error);
// // // // // // // // // // // // // //             Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => (
// // // // // // // // // // // // // //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// // // // // // // // // // // // // //         ),
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}>
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}>
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setFrom)}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 onChangeText={(text) => handleInputChange(text, setTo)}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;



// // // // // // // // // // // // // // import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import routeResponse from '@/assets/data/route.json';
// // // // // // // // // // // // // // import destinationResponse from '@/assets/data/destination.json';
// // // // // // // // // // // // // // import geoCodingResponse from '@/assets/data/geoCoding.json';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions'; // Adjust path as needed
// // // // // // // // // // // // // // import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// // // // // // // // // // // // // // import { geoCoding } from '@/services/geoCoding';
// // // // // // // // // // // // // // import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const [from, setFrom] = useState('');
// // // // // // // // // // // // // //     const [to, setTo] = useState('');
   
// // // // // // // // // // // // // //     console.log("From::", from)
// // // // // // // // // // // // // //     console.log("To:: ", to)
// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);


// // // // // // // // // // // // // //     const pickupCoordinates = routeResponse.routes[0].geometry.coordinates;
// // // // // // // // // // // // // //     const destinationCoordinates = destinationResponse.features[0].geometry.coordinates;

    

// // // // // // // // // // // // // //     const pickupAddress = geoCodingResponse.features[0].place_name;
// // // // // // // // // // // // // //     const destinationAddress = geoCodingResponse.features[1].place_name;

// // // // // // // // // // // // // //     const [coordinates, setCoordinates] = useState<number[][]>(pickupCoordinates);

// // // // // // // // // // // // // //     // console.log("destination:", destinationCoordinates);
// // // // // // // // // // // // // //     // console.log("origin: >", pickupCoordinates)
// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
// // // // // // // // // // // // // //     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

// // // // // // // // // // // // // //     const handleOnPressContinue = async (event: OnPressEvent) => {
// // // // // // // // // // // // // //         const newDirections = getDirections()
// // // // // // // // // // // // // //         const pickup = pickupInputRef.current?.value;
// // // // // // // // // // // // // //         const destination = destinationInputRef.current?.value;
// // // // // // // // // // // // // //         //string

// // // // // // // // // // // // // //         await geoCoding([event.coordinates.longitude, event.coordinates.latitude],[event.coordinates.longitude, event.coordinates.latitude])

// // // // // // // // // // // // // //         const pickUpNums = p

// // // // // // // // // // // // // //         if (!pickup || !destination) {
// // // // // // // // // // // // // //             Alert.alert('Error', 'Please fill in both pickup and destination locations');
// // // // // // // // // // // // // //             return;
// // // // // // // // // // // // // //         }

// // // // // // // // // // // // // //         try {
// // // // // // // // // // // // // //             const pickupCoordinates = await getCoordinatesFromAddress(pickup);
// // // // // // // // // // // // // //             const destinationCoordinates = await getCoordinatesFromAddress(destination);

// // // // // // // // // // // // // //             if (pickupCoordinates && destinationCoordinates) {
// // // // // // // // // // // // // //                 setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //                 setDestinationLocation(destinationCoordinates);

// // // // // // // // // // // // // //                 const coordinates = await getDirections(pickupCoordinates, destinationCoordinates);
// // // // // // // // // // // // // //                 if (coordinates) {
// // // // // // // // // // // // // //                     setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //                     setDestinationLocation(destinationCoordinates)
// // // // // // // // // // // // // //                     router.push('/vehicles');
// // // // // // // // // // // // // //                 } else {
// // // // // // // // // // // // // //                     throw new Error('No route coordinates found');
// // // // // // // // // // // // // //                 }
// // // // // // // // // // // // // //             } else {
// // // // // // // // // // // // // //                 throw new Error('Failed to fetch coordinates for pickup or destination');
// // // // // // // // // // // // // //             }
// // // // // // // // // // // // // //         } catch (error) {
// // // // // // // // // // // // // //             console.error('Error fetching directions:', error);
// // // // // // // // // // // // // //             Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => (
// // // // // // // // // // // // // //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// // // // // // // // // // // // // //         ),
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     const getCoordinatesFromAddress = async (address: string): Promise<number[] | null> => {
// // // // // // // // // // // // // //         // Implement your logic to convert address to coordinates (geocoding)
        
// // // // // // // // // // // // // //         // This is where you would typically use a geocoding API
// // // // // // // // // // // // // //         return null; // Replace with actual implementation
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     useEffect(() => {
// // // // // // // // // // // // // //         setCoordinates(pickupCoordinates);
// // // // // // // // // // // // // //     },[])
    

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/outdoors-v12"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}>
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}>
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 onChangeText={setFrom}
// // // // // // // // // // // // // //                                 value={from}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 onChangeText={setTo}
// // // // // // // // // // // // // //                                 value={to}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={() => handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         borderRadius: 20,
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         color: '#333',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // //         elevation: 2,
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         color: '#ff0000',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });



// // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
// // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // // // // // // import { getDirections } from '@/services/directions'; // Adjust path as needed
// // // // // // // // // // // // // // // import { Coordinates } from '@/types'; // Assuming you have a types file for coordinates
// // // // // // // // // // // // // // import myOrigin from '@/assets/data/origin.json'


// // // // // // // // // // // // // // const HomePage: React.FC = () => {
// // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // //     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
// // // // // // // // // // // // // //     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

// // // // // // // // // // // // // //     const origin = myOrigin.features[0].geometry.coordinates;

// // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(1);
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const pickupInputRef = useRef<any>('');
// // // // // // // // // // // // // //     const destinationInputRef = useRef<any>('');

// // // // // // // // // // // // // //     const handleOnPressContinue = async () => {
// // // // // // // // // // // // // //         const pickupLocation = await origin;
// // // // // // // // // // // // // //         const destination = destinationInputRef.current?.value;

// // // // // // // // // // // // // //         if (!pickupLocation || !destination) {
// // // // // // // // // // // // // //             Alert.alert('Error', 'Please fill in both pickup and destination locations');
// // // // // // // // // // // // // //             return;
// // // // // // // // // // // // // //         }
// // // // // // // // // // // // // //         else {

// // // // // // // // // // // // // //         }

// // // // // // // // // // // // // //         // const pickupCoordinates = await getCoordinatesFromAddress(pickup);
// // // // // // // // // // // // // //         // const destinationCoordinates = await getCoordinatesFromAddress(destination);

// // // // // // // // // // // // // //         // if (pickupCoordinates && destinationCoordinates) {
// // // // // // // // // // // // // //         //     setPickupLocation(pickupCoordinates);
// // // // // // // // // // // // // //         //     setDestinationLocation(destinationCoordinates);

// // // // // // // // // // // // // //         //     try {
// // // // // // // // // // // // // //         //         const coordinates = await getDirections(pickupCoordinates, destinationCoordinates);
// // // // // // // // // // // // // //         //         if (coordinates) {
// // // // // // // // // // // // // //         //             setDirectionCoordinates(coordinates);
// // // // // // // // // // // // // //         //             router.push('/myOrders', { pickup, destination });
// // // // // // // // // // // // // //         //         } else {
// // // // // // // // // // // // // //         //             throw new Error('No route coordinates found');
// // // // // // // // // // // // // //         //         }
// // // // // // // // // // // // // //         //     } catch (error) {
// // // // // // // // // // // // // //         //         console.error('Error getting directions:', error);
// // // // // // // // // // // // // //         //         Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
// // // // // // // // // // // // // //         //     }
// // // // // // // // // // // // // //         // }
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // //         (props: any) => (
// // // // // // // // // // // // // //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// // // // // // // // // // // // // //         ),
// // // // // // // // // // // // // //         []
// // // // // // // // // // // // // //     );

// // // // // // // // // // // // // //     if (!accessToken) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <SafeAreaView style={styles.errorContainer}>
// // // // // // // // // // // // // //                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
// // // // // // // // // // // // // //             </SafeAreaView>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // //                 <MapView style={styles.map}
// // // // // // // // // // // // // //                     styleURL="mapbox://styles/mapbox/dark-v11"
// // // // // // // // // // // // // //                     zoomEnabled={true}
// // // // // // // // // // // // // //                     rotateEnabled={false}>
// // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
// // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // //                             radius: 100.0,
// // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // //                     {directionCoordinates && (
// // // // // // // // // // // // // //                         <ShapeSource
// // // // // // // // // // // // // //                             id="routeSource"
// // // // // // // // // // // // // //                             lineMetrics
// // // // // // // // // // // // // //                             shape={{
// // // // // // // // // // // // // //                                 type: 'Feature',
// // // // // // // // // // // // // //                                 geometry: {
// // // // // // // // // // // // // //                                     type: 'LineString',
// // // // // // // // // // // // // //                                     coordinates: directionCoordinates,
// // // // // // // // // // // // // //                                 },
// // // // // // // // // // // // // //                             }}>
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-background"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineOpacity: 0.4,
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <LineLayer
// // // // // // // // // // // // // //                                 id="line-dashed"
// // // // // // // // // // // // // //                                 style={{
// // // // // // // // // // // // // //                                     lineColor: 'yellow',
// // // // // // // // // // // // // //                                     lineCap: 'round',
// // // // // // // // // // // // // //                                     lineJoin: 'round',
// // // // // // // // // // // // // //                                     lineWidth: 6,
// // // // // // // // // // // // // //                                     lineDasharray: [0, 4, 3],
// // // // // // // // // // // // // //                                 }}
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </ShapeSource>
// // // // // // // // // // // // // //                     )}
// // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };


// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         borderRadius: 20,
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         color: '#333',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // //         elevation: 2,
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorContainer: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     errorText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         color: '#ff0000',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // });

// // // // // // // // // // // // // // export default HomePage;


// // // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef, useState } from 'react';
// // // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View, Image, Platform, Alert } from 'react-native';
// // // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // // import Svg, { Path } from 'react-native-svg';
// // // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // // import { useRouter } from 'expo-router';

// // // // // // // // // // // // // // // const HomePage = () => {
// // // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(2);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const [location, setLocation] = useState();
// // // // // // // // // // // // // // //     const [destination, setDestination] = useState();
// // // // // // // // // // // // // // //     const [isLocationFetching, setIsLocationFetching] = useState(false);

// // // // // // // // // // // // // // //     const handleOnPressContinue = () => {
// // // // // // // // // // // // // // //         // Add your logic for handling the continue button press here
// // // // // // // // // // // // // // //         // For example, you might validate input fields before navigating
// // // // // // // // // // // // // // //         // const pickupLocation = pickupInputRef.current?.value;
// // // // // // // // // // // // // // //         // const destination = destinationInputRef.current?.value;


// // // // // // // // // // // // // // //         if (!pickupLocation || !destination) {
// // // // // // // // // // // // // // //             Alert.alert('Error', 'Please fill in both pickup and destination locations');
// // // // // // // // // // // // // // //             return;
// // // // // // // // // // // // // // //         }

// // // // // // // // // // // // // // //         // router.push('/myOrders', { pickupLocation, destination });
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // // //         (props: any) => (
// // // // // // // // // // // // // // //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// // // // // // // // // // // // // // //         ),
// // // // // // // // // // // // // // //         []
// // // // // // // // // // // // // // //     );

// // // // // // // // // // // // // // //     const pickupInputRef = useRef(null);
// // // // // // // // // // // // // // //     const destinationInputRef = useRef(null);

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // // // //                 <MapView style={styles.map} styleURL="">
// // // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={12} />
// // // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // // //                             radius: 70.0,
// // // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // // //                     />

                    
// // // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // // //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // // //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// // // // // // // // // // // // // // //                     <AntDesign name="arrowright" size={24} color="white" />
// // // // // // // // // // // // // // //                 </TouchableOpacity>
// // // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Transparent backdrop
// // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // // //                             <Text style={styles.headerText}>Book Your Move</Text>
// // // // // // // // // // // // // // //                             <TouchableOpacity onPress={handleClosePress}>
// // // // // // // // // // // // // // //                                 <AntDesign name="closecircle" size={24} color="#333" />
// // // // // // // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // // //                         <View style={styles.inputContainer}>
// // // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // // //                                 ref={pickupInputRef}
// // // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // // //                                 placeholder="Pickup Location"
// // // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // //                             <BottomSheetTextInput
// // // // // // // // // // // // // // //                                 ref={destinationInputRef}
// // // // // // // // // // // // // // //                                 style={styles.input}
// // // // // // // // // // // // // // //                                 placeholder="Destination"
// // // // // // // // // // // // // // //                                 placeholderTextColor="#888"
// // // // // // // // // // // // // // //                             />
// // // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // // // ... styles


// // // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     map: {
// // // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         height: '100%',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // // //         right: 30,
// // // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // // // //         padding: 15,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         marginRight: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // // //         borderRadius: 20,
// // // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: '#333',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     inputContainer: {
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 2,
// // // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // // });




// // // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef } from 'react';
// // // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // // import Svg, { Path } from 'react-native-svg';
// // // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // // import { useRouter } from 'expo-router';

// // // // // // // // // // // // // // // const HomePage = () => {
// // // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // // //     const handleOnPressContinue = () => {
// // // // // // // // // // // // // // //         router.push('/myOrders');
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(2);
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // // //         bottomSheetRef.current?.close();
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // // //         (props: any) => (
// // // // // // // // // // // // // // //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// // // // // // // // // // // // // // //         ),
// // // // // // // // // // // // // // //         []
// // // // // // // // // // // // // // //     );

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // // //             <StatusBar style="dark" />
// // // // // // // // // // // // // // //             <View style={{ flex: 1 }}>
// // // // // // // // // // // // // // //                 <MapView style={{ flex: 1 }} styleURL="">
// // // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={12} />
// // // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // // //                             radius: 70.0,
// // // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // // // // //                     <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// // // // // // // // // // // // // // //                         <Text style={styles.buttonText1}>Book Move-Easy</Text>
// // // // // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="black" style={styles.arrowIcon} />
// // // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // //                     <View style={styles.bottomSheetContainer}>
// // // // // // // // // // // // // // //                         <View style={styles.headerContainer}>
// // // // // // // // // // // // // // //                             <Text style={styles.headerText}>Good Morning, Jeff!</Text>
// // // // // // // // // // // // // // //                             {/* Add a close button or other elements here if needed */}
// // // // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // // // //                         <BottomSheetTextInput style={styles.input} placeholder="Where From?" />
// // // // // // // // // // // // // // //                         <BottomSheetTextInput style={styles.input} placeholder="Where To?" />
// // // // // // // // // // // // // // //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// // // // // // // // // // // // // // //                             <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         paddingHorizontal: 10,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonContent: {
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // // //         paddingVertical: 5,
// // // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // // //         backgroundColor: '#FFEA00',
// // // // // // // // // // // // // // //         borderRadius: 25,
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.8,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText1: {
// // // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: 'black',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     arrowIcon: {
// // // // // // // // // // // // // // //         marginLeft: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 2,
// // // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: '#333',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         backgroundColor: 'yellow',
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         padding: 16,
// // // // // // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOpacity: 0.9,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // // //         backgroundColor: '#007AFF',
// // // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // // //         paddingVertical: 15,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     bottomSheetContainer: {
// // // // // // // // // // // // // // //         backgroundColor: '#F5F5F5',
// // // // // // // // // // // // // // //         borderRadius: 20,
// // // // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // // });



// // // // // // // // // // // // // // // import React, { useCallback, useMemo, useRef } from 'react';
// // // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // // import Svg, { Path } from 'react-native-svg';
// // // // // // // // // // // // // // // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // // // // import { useRouter } from 'expo-router';

// // // // // // // // // // // // // // // const HomePage = () => {
// // // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// // // // // // // // // // // // // // //     const router = useRouter();

// // // // // // // // // // // // // // //     const handleOnPressContinue = () => {
// // // // // // // // // // // // // // //         router.push('/myOrders');
// // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// // // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);

// // // // // // // // // // // // // // //     const handleOpenPress = () => {
// // // // // // // // // // // // // // //         bottomSheetRef.current?.snapToIndex(2);

// // // // // // // // // // // // // // //     };
// // // // // // // // // // // // // // //     const handleClosePress = () => {
// // // // // // // // // // // // // // //         bottomSheetRef.current?.close();

// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //     const renderBackdrop = useCallback(
// // // // // // // // // // // // // // //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0}
// // // // // // // // // // // // // // //             {...props} />,
// // // // // // // // // // // // // // //         []
// // // // // // // // // // // // // // //     );

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // // //             <StatusBar style='dark' />
// // // // // // // // // // // // // // //             <View style={{ flex: 1 }}>
// // // // // // // // // // // // // // //                 <MapView style={{ flex: 1 }} styleURL=''>
// // // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={12} />
// // // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // // //                             radius: 70.0,
// // // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // // //                 <View style={styles.buttonContainer}>
// // // // // // // // // // // // // // //                     <TouchableOpacity style={styles.button}
// // // // // // // // // // // // // // //                         onPress={handleOpenPress}>
// // // // // // // // // // // // // // //                         <Text style={styles.buttonText1}>Book Move-Easy</Text>
// // // // // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="black" style={styles.arrowIcon} />
// // // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // // //                 <BottomSheet
// // // // // // // // // // // // // // //                     ref={bottomSheetRef}
// // // // // // // // // // // // // // //                     snapPoints={snapPoints}
// // // // // // // // // // // // // // //                     backdropComponent={renderBackdrop}
// // // // // // // // // // // // // // //                     index={0}
// // // // // // // // // // // // // // //                     enablePanDownToClose={true}
// // // // // // // // // // // // // // //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// // // // // // // // // // // // // // //                     backgroundStyle={{ backgroundColor: '#fff' }}
// // // // // // // // // // // // // // //                 >
// // // // // // // // // // // // // // //                     <View style={styles.headerContainer}>
// // // // // // // // // // // // // // //                         <Text style={styles.headerText}>Good Morning, Jeff!</Text>
// // // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // // //                     {/* <Text>Enter Your Location</Text> */}
// // // // // // // // // // // // // // //                     <BottomSheetTextInput style={styles.input}
// // // // // // // // // // // // // // //                         placeholder='Where From?'
// // // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // // //                     <BottomSheetTextInput style={styles.input}
// // // // // // // // // // // // // // //                         placeholder='Where To?'
// // // // // // // // // // // // // // //                     />

// // // // // // // // // // // // // // //                     <TouchableOpacity style={styles.continueButton}
// // // // // // // // // // // // // // //                         onPress={handleOnPressContinue}>
// // // // // // // // // // // // // // //                         <Text style={styles.buttonText2}>Continue</Text>
// // // // // // // // // // // // // // //                     </TouchableOpacity>

// // // // // // // // // // // // // // //                 </BottomSheet>
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // // //     )
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // export default HomePage;

// // // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // // //         bottom: 30,
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         paddingHorizontal: 10,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonContent: {
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // // //         paddingVertical: 5,
// // // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // // //         backgroundColor: '#FFEA00',
// // // // // // // // // // // // // // //         borderRadius: 25,
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.8,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText1: {
// // // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: 'black',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText2: {
// // // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: 'black',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     arrowIcon: {
// // // // // // // // // // // // // // //         marginLeft: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     input: {
// // // // // // // // // // // // // // //         marginTop: 8,
// // // // // // // // // // // // // // //         marginHorizontal: 16,
// // // // // // // // // // // // // // //         marginBottom: 16,
// // // // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // // // //         lineHeight: 20,
// // // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // // //         backgroundColor: 'rgba(151, 151, 151, 0.25)',
// // // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: 'black',
// // // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     button: {
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         backgroundColor: 'yellow',
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         padding: 16,
// // // // // // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOpacity: 0.9,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         backgroundColor: 'yellow',
// // // // // // // // // // // // // // //         padding: 16,
// // // // // // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOpacity: 0.9,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // // });




// // // // // // // // // // // // // // // import React, { useMemo, useRef } from 'react';
// // // // // // // // // // // // // // // import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // // // // // // // import Svg, { Path } from 'react-native-svg';
// // // // // // // // // // // // // // // import BottomSheet from '@gorhom/bottom-sheet';
// // // // // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';

// // // // // // // // // // // // // // // const HomePage = () => {
// // // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

// // // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // // //     const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
// // // // // // // // // // // // // // //     const bottomSheetRef = useRef<BottomSheet>(null);


// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // // //             <StatusBar style='dark' />
// // // // // // // // // // // // // // //             <View style={{ flex: 1, marginTop: headerHeight }}>
// // // // // // // // // // // // // // //                 <MapView style={{ flex: 1 }} styleURL=''>
// // // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={12} />
// // // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // // //                             radius: 70.0,
// // // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // // //                 <View style={[]}>
// // // // // // // // // // // // // // //                     <TouchableOpacity style={styles.buttonContainer}>
// // // // // // // // // // // // // // //                         <Text>Book Move-Easy</Text>
// // // // // // // // // // // // // // //                         <AntDesign name="arrowright" size={24} color="black" />
// // // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // // //                 {/* <BottomSheet
// // // // // // // // // // // // // // //                 ref={bottomSheetRef}
// // // // // // // // // // // // // // //                 snapPoints={snapPoints}
// // // // // // // // // // // // // // //                     index={1}>
// // // // // // // // // // // // // // //                     <View>
// // // // // // // // // // // // // // //                         <Text>Hello World</Text>
// // // // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // // // //                 </BottomSheet> */}
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // // //     )
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // export default HomePage

// // // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // // //     wave: {
// // // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // // //         bottom: 0,
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         height: 80,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonContainer: {
// // // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // // //         bottom: 0,
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         paddingHorizontal: 20, // Adjust padding as needed
// // // // // // // // // // // // // // //         paddingVertical: 20,
// // // // // // // // // // // // // // //         backgroundColor: 'yellow',
// // // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.8,
// // // // // // // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // // //         borderRadius: 20, // Border radius for the curved left edge
// // // // // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //         justifyContent: 'space-between', // Ensure arrow is on the rightmost side
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     arrowIcon: {
// // // // // // // // // // // // // // //         marginRight: 10, // Adjust spacing between button content and arrow
// // // // // // // // // // // // // // //         // Add any additional styling for the arrow icon
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     buttonText: {
// // // // // // // // // // // // // // //         fontSize: 26,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: 'black',
// // // // // // // // // // // // // // //         // Add any additional text styling
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // // });


// // // // // // // // // // // // // // // import { Button, StyleSheet, Text, View } from 'react-native'
// // // // // // // // // // // // // // // import React from 'react'
// // // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // // // // // // // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';

// // // // // // // // // // // // // // // const HomePage = () => {
// // // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();
// // // // // // // // // // // // // // //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

// // // // // // // // // // // // // // //     Mapbox.setAccessToken(accessToken);

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // // //             <StatusBar style='dark' />
// // // // // // // // // // // // // // //             <View style={{ flex: 1, marginTop: headerHeight }}>
// // // // // // // // // // // // // // //                 <MapView style={{ flex: 1 }} styleURL=''>
// // // // // // // // // // // // // // //                     <Camera followUserLocation followZoomLevel={14} />
// // // // // // // // // // // // // // //                     <LocationPuck
// // // // // // // // // // // // // // //                         topImage="topImage"
// // // // // // // // // // // // // // //                         visible={true}
// // // // // // // // // // // // // // //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// // // // // // // // // // // // // // //                         pulsing={{
// // // // // // // // // // // // // // //                             isEnabled: true,
// // // // // // // // // // // // // // //                             color: 'blue',
// // // // // // // // // // // // // // //                             radius: 70.0,
// // // // // // // // // // // // // // //                         }}
// // // // // // // // // // // // // // //                     />
// // // // // // // // // // // // // // //                 </MapView>
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // // //     )
// // // // // // // // // // // // // // // }

// // // // // // // // // // // // // // // export default HomePage

// // // // // // // // // // // // // // // const styles = StyleSheet.create({})