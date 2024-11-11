import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { bookVehicle, setSelectedVehicle } from '@/app/context/slices/navSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface Vehicle {
  id: string;
  name: string;
  type: string;
  image: string;
  description: string;
  capacity: string;
  price: string;
}

interface VehicleDetail extends Vehicle {
  year: string;
  laborPrice: string;
  rating: number;
  features: string[];
  availability?: string;
  insuranceIncluded?: boolean;
}

const COLORS = {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  primary: '#00ff87',
  primaryDark: '#00cc6a',
  accent: '#ff3366',
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    tertiary: '#808080',
  },
  overlay: 'rgba(0,0,0,0.7)',
};

// Convert USD to KES (1 USD = ~160 KES as of 2024)
const USD_TO_KES = 160;

const vehicleDetails: Record<string, VehicleDetail> = {
  'pickup-truck': {
    id: 'pickup-truck',
    name: 'Pick up Truck',
    type: 'Full Size Truck',
    year: '2020',
    description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
    image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
    price: 'KES 14,240/hour',
    laborPrice: 'KES 4,800/hour per worker',
    rating: 4.5,
    capacity: '907 kg',
    availability: 'Available Now',
    insuranceIncluded: true,
    features: [
      'Spacious cargo bed',
      'Heavy-duty capacity',
      'Construction materials',
      'Large furniture',
      'Safety features',
      'GPS tracking'
    ],
  },
  'van': {
    id: 'van',
    name: 'Van',
    type: 'Standard Van',
    year: '2022',
    description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
    image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
    price: 'KES 15,840/hour',
    laborPrice: 'KES 4,800/hour per worker',
    rating: 4.7,
    capacity: '1.36 tonnes',
    availability: 'Available Tomorrow',
    insuranceIncluded: true,
    features: [
      'Enclosed cargo space',
      'Weather protection',
      'Easy loading',
      'Fuel efficient',
      'Security features',
      'Climate control'
    ],
  },
  'truck': {
    id: 'truck',
    name: 'Truck',
    type: 'Standard Truck',
    year: '2021',
    description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
    image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
    price: 'KES 20,640/hour',
    laborPrice: 'KES 4,800/hour per worker',
    rating: 4.6,
    capacity: '2.27 tonnes',
    availability: 'Available in 2 days',
    insuranceIncluded: true,
    features: [
      'Massive cargo space',
      'Hydraulic lift',
      'Professional grade',
      'Long distance ready',
      'Advanced safety',
      'Load securing system'
    ],
  },
  'truck-xl': {
    id: 'truck-xl',
    name: 'Truck XL',
    type: 'Extra Large Truck',
    year: '2021',
    description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
    image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
    price: 'KES 25,440/hour',
    laborPrice: 'KES 4,800/hour per worker',
    rating: 4.8,
    capacity: '3.63 tonnes',
    availability: 'Available Next Week',
    insuranceIncluded: true,
    features: [
      'Maximum cargo space',
      'Heavy duty hydraulic lift',
      'Commercial grade',
      'Cross-country capable',
      'Advanced safety systems',
      'Professional load management'
    ],
  },
};

const VehicleDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const vehicle = vehicleDetails[id as string];
  const [scrollY] = useState(new Animated.Value(0));

  if (!vehicle) {
    return (
      <View style={styles.notFoundContainer}>
        <LinearGradient
          colors={[COLORS.background, COLORS.surface]}
          style={StyleSheet.absoluteFillObject}
        />
        <MaterialCommunityIcons name="car-off" size={84} color={COLORS.text.secondary} />
        <Text style={styles.notFoundText}>Vehicle not found</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: COLORS.primary }]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: COLORS.background }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <AntDesign 
          key={`star-${i}`} 
          name="star" 
          size={18} 
          color={COLORS.primary} 
          style={{ marginRight: 2 }} 
        />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <MaterialCommunityIcons 
          key="star-half" 
          name="star-half-full" 
          size={18} 
          color={COLORS.primary} 
          style={{ marginRight: 2 }} 
        />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <AntDesign 
          key={`star-empty-${i}`} 
          name="staro" 
          size={18} 
          color={COLORS.text.tertiary} 
          style={{ marginRight: 2 }} 
        />
      );
    }
    return stars;
  };

  const handleBookVehicle = () => {
    dispatch(setSelectedVehicle(vehicle));
    dispatch(bookVehicle());
    router.push({
      pathname: '/(authenticated)/(tabs)/CalendarScreen',
      params: { id: vehicle.id },
    });
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={StyleSheet.absoluteFillObject} />
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{vehicle.name}</Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView} 
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', COLORS.background]}
            style={styles.imageOverlay}
          />
          <TouchableOpacity 
            style={styles.floatingBackButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{vehicle.name}</Text>
              <View style={styles.availabilityBadge}>
                <View style={[styles.availabilityDot, { 
                  backgroundColor: vehicle.availability?.includes('Now') ? '#4CAF50' : '#FFA000'
                }]} />
                <Text style={styles.availabilityText}>{vehicle.availability}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{vehicle.type} • {vehicle.year}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>{renderStars(vehicle.rating)}</View>
              <Text style={styles.ratingText}>
                {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
              </Text>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.quickInfoCard}>
              <MaterialCommunityIcons name="weight" size={24} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>Capacity</Text>
              <Text style={styles.quickInfoValue}>{vehicle.capacity}</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>Insurance</Text>
              <Text style={styles.quickInfoValue}>Included</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.primary} />
              <Text style={styles.quickInfoLabel}>Min. Rental</Text>
              <Text style={styles.quickInfoValue}>2 Hours</Text>
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Description</Text>
            <Text style={styles.description}>{vehicle.description}</Text>
          </View>

          {/* Pricing Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pricing</Text>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Vehicle Rate</Text>
                <Text style={styles.priceValue}>{vehicle.price}</Text>
              </View>
              <View style={styles.laborPriceContainer}>
                <Text style={styles.priceLabel}>Labor Rate</Text>
                <Text style={styles.laborPriceValue}>{vehicle.laborPrice}</Text>
              </View>
            </View>
          </View>

          {/* Features Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {vehicle.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.featureIcon} 
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Booking Button */}
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookVehicle}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.bookButtonText}>Book Now</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  heroContainer: {
    position: 'relative',
    height: 380,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  floatingBackButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    marginTop: -20,
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  laborPriceContainer: {
    alignItems: 'flex-end',
  },
  laborPriceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  bookButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.background,
    marginRight: 8,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginVertical: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleDetail;



// import React from 'react';
// import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useDispatch } from 'react-redux';
// import { bookVehicle, setSelectedVehicle } from '@/app/context/slices/navSlice';

// const { width } = Dimensions.get('window');

// interface Vehicle {
//   id: string;
//   name: string;
//   type: string;
//   image: string;
//   description: string;
//   capacity: string;
//   price: string;
// }

// interface VehicleDetail extends Vehicle {
//   year: string;
//   laborPrice: string;
//   rating: number;
//   features: string[];
// }

// const COLORS = {
//   background: '#1c1c1e',
//   surface: '#2c2c2e',
//   primary: '#1fd655',
//   text: {
//     primary: '#f5f5f7',
//     secondary: '#a1a1a3',
//   },
//   overlay: 'rgba(0,0,0,0.5)',
// };

// const vehicleDetails: Record<string, VehicleDetail> = {
//   'pickup-truck': {
//     id: 'pickup-truck',
//     name: 'Pick up Truck',
//     type: 'Full Size Truck',
//     year: '2020',
//     description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
//     image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
//     price: '$89/hour',
//     laborPrice: '$30/hour per worker',
//     rating: 4.5,
//     capacity: '2000 lbs',
//     features: [
//       'Spacious cargo bed',
//       'Heavy-duty capacity',
//       'Construction materials',
//       'Large furniture',
//       'Safety features',
//       'GPS tracking'
//     ],
//   },
//   'van': {
//     id: 'van',
//     name: 'Van',
//     type: 'Standard Van',
//     year: '2022',
//     description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
//     image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
//     price: '$99/hour',
//     laborPrice: '$30/hour per worker',
//     rating: 4.7,
//     capacity: '3000 lbs',
//     features: [
//       'Enclosed cargo space',
//       'Weather protection',
//       'Easy loading',
//       'Fuel efficient',
//       'Security features',
//       'Climate control'
//     ],
//   },
//   'truck': {
//     id: 'truck',
//     name: 'Truck',
//     type: 'Standard Truck',
//     year: '2021',
//     description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
//     image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
//     price: '$129/hour',
//     laborPrice: '$30/hour per worker',
//     rating: 4.6,
//     capacity: '5000 lbs',
//     features: [
//       'Massive cargo space',
//       'Hydraulic lift',
//       'Professional grade',
//       'Long distance ready',
//       'Advanced safety',
//       'Load securing system'
//     ],
//   },
//   'truck-xl': {
//     id: 'truck-xl',
//     name: 'Truck XL',
//     type: 'Extra Large Truck',
//     year: '2021',
//     description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
//     image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
//     price: '$159/hour',
//     laborPrice: '$30/hour per worker',
//     rating: 4.8,
//     capacity: '8000 lbs',
//     features: [
//       'Maximum cargo space',
//       'Heavy duty hydraulic lift',
//       'Commercial grade',
//       'Cross-country capable',
//       'Advanced safety systems',
//       'Professional load management'
//     ],
//   },
// };


// const VehicleDetail = () => {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();
//   const dispatch = useDispatch();
//   const vehicle = vehicleDetails[id as string];

//   if (!vehicle) {
//     return (
//       <View style={styles.notFoundContainer}>
//         <MaterialCommunityIcons name="car-off" size={64} color={COLORS.text.secondary} />
//         <Text style={styles.notFoundText}>Vehicle not found</Text>
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//           <Text style={styles.backButtonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const renderStars = (rating: number) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 !== 0;

//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<AntDesign key={`star-${i}`} name="star" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />);
//     }
//     if (hasHalfStar) {
//       stars.push(<MaterialCommunityIcons key="star-half" name="star-half-full" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />);
//     }
//     const emptyStars = 5 - Math.ceil(rating);
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<AntDesign key={`star-empty-${i}`} name="staro" size={20} color={COLORS.text.secondary} style={{ marginRight: 4 }} />);
//     }
//     return stars;
//   };

//   const handleBookVehicle = () => {
//     dispatch(setSelectedVehicle(vehicle));
//     dispatch(bookVehicle());
//     router.push({
//       pathname: '/(authenticated)/(tabs)/CalendarScreen',
//       params: { id: vehicle.id },
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <ScrollView style={styles.scrollView} bounces={false}>
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//             <MaterialCommunityIcons name="arrow-left" size={26} color={COLORS.primary} />
//           </TouchableOpacity>
//         </View>

//         <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />

//         <View style={styles.contentContainer}>
//           <View style={styles.titleContainer}>
//             <Text style={styles.name}>{vehicle.name}</Text>
//             <View style={styles.ratingContainer}>
//               <View style={styles.stars}>{renderStars(vehicle.rating)}</View>
//               <Text style={styles.ratingText}>
//                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
//               </Text>
//             </View>
//           </View>

//           <View style ={styles.infoCard}>
//             <Text style={styles.infoText}>
//               <Text style={styles.infoTitle}>Type:</Text> {vehicle.type} - {vehicle.year}
//             </Text>
//             <Text style={styles.infoText}>
//               <Text style={styles.infoTitle}>Capacity:</Text> {vehicle.capacity}
//             </Text>
//             <Text style={styles.infoText}>
//               <Text style={styles.infoTitle}>Description:</Text> {vehicle.description}
//             </Text>
//           </View>

//           <View style={styles.priceContainer}>
//             <Text style={styles.priceLabel}>Vehicle Rate</Text>
//             <Text style={styles.priceValue}>{vehicle.price}</Text>
//             <Text style={styles.priceSubtext}>Labor: {vehicle.laborPrice}</Text>
//           </View>

//           <View style={styles.featuresContainer}>
//             <Text style={styles.featuresTitle}>Features</Text>
//             {vehicle.features.map((feature, index) => (
//               <Text key={index} style={styles.featureItem}>• {feature}</Text>
//             ))}
//           </View>

//           <TouchableOpacity style={styles.bookButton} onPress={handleBookVehicle}>
//             <Text style={styles.bookButtonText}>Book Now</Text>
//             <MaterialCommunityIcons name="arrow-right" size={24} color="#000000" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.background },
//   scrollView: { flex: 1 },
//   header: { padding: 20, position: 'absolute', zIndex: 1, width: '100%' },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: COLORS.overlay,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 14,
//   },
//   vehicleImage: { width: '100%', height: 300 },
//   contentContainer: { padding: 20 },
//   titleContainer: { marginBottom: 24 },
//   name: { fontSize: 28, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 8 },
//   ratingContainer: { flexDirection: 'row', alignItems: 'center' },
//   stars: { flexDirection: 'row', marginRight: 8 },
//   ratingText: { color: COLORS.text.secondary, fontSize: 14 },
//   infoCard: {
//     backgroundColor: COLORS.surface,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//     elevation: 2,
//   },
//   infoText: { fontSize: 16, color: COLORS.text.primary, marginVertical: 4 },
//   infoTitle: { fontWeight: 'bold' },
//   priceContainer: {
//     backgroundColor: COLORS.surface,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//     elevation: 2,
//     alignItems: 'center',
//   },
//   priceLabel: { fontSize: 14, color: COLORS.text.secondary },
//   priceValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
//   priceSubtext: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
//   featuresContainer: { marginBottom: 24 },
//   featuresTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 8 },
//   featureItem: { fontSize: 14, color: COLORS.text.secondary, marginLeft: 10 },
//   bookButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 3,
//   },
//   bookButtonText: { color: '#000000', fontSize: 18, fontWeight: '600', marginRight: 8 },
//   notFoundContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   notFoundText: { color: COLORS.text.primary, fontSize: 20, marginVertical: 16 },
// });

// export default VehicleDetail;



// // import React from 'react';
// // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // import { useLocalSearchParams, useRouter } from 'expo-router';
// // import { useDispatch } from 'react-redux';
// // import { bookVehicle, setSelectedVehicle } from '@/app/context/slices/navSlice';
// // import { LinearGradient } from 'expo-linear-gradient';

// // const { width } = Dimensions.get('window');

// // interface Vehicle {
// //   id: string;
// //   name: string;
// //   type: string;
// //   image: string;
// //   description: string;
// //   capacity: string;
// //   price: string;
// // }

// // interface VehicleDetail extends Vehicle {
// //   year: string;
// //   laborPrice: string;
// //   rating: number;
// //   features: string[];
// // }

// // const COLORS = {
// //   background: '#1c1c1e',
// //   surface: '#2c2c2e',
// //   primary: '#1fd655',
// //   text: {
// //     primary: '#f5f5f7',
// //     secondary: '#a1a1a3',
// //   },
// //   overlay: 'rgba(0,0,0,0.5)',
// // };

// // const vehicleDetails: Record<string, VehicleDetail> = {
// //   'pickup-truck': {
// //     id: 'pickup-truck',
// //     name: 'Pick up Truck',
// //     type: 'Full Size Truck',
// //     year: '2020',
// //     description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
// //     image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// //     price: '$89/hour',
// //     laborPrice: '$30/hour per worker',
// //     rating: 4.5,
// //     capacity: '2000 lbs',
// //     features: [
// //       'Spacious cargo bed',
// //       'Heavy-duty capacity',
// //       'Construction materials',
// //       'Large furniture',
// //       'Safety features',
// //       'GPS tracking'
// //     ],
// //   },
// //   'van': {
// //     id: 'van',
// //     name: 'Van',
// //     type: 'Standard Van',
// //     year: '2022',
// //     description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
// //     image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// //     price: '$99/hour',
// //     laborPrice: '$30/hour per worker',
// //     rating: 4.7,
// //     capacity: '3000 lbs',
// //     features: [
// //       'Enclosed cargo space',
// //       'Weather protection',
// //       'Easy loading',
// //       'Fuel efficient',
// //       'Security features',
// //       'Climate control'
// //     ],
// //   },
// //   'truck': {
// //     id: 'truck',
// //     name: 'Truck',
// //     type: 'Standard Truck',
// //     year: '2021',
// //     description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
// //     image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// //     price: '$129/hour',
// //     laborPrice: '$30/hour per worker',
// //     rating: 4.6,
// //     capacity: '5000 lbs',
// //     features: [
// //       'Massive cargo space',
// //       'Hydraulic lift',
// //       'Professional grade',
// //       'Long distance ready',
// //       'Advanced safety',
// //       'Load securing system'
// //     ],
// //   },
// //   'truck-xl': {
// //     id: 'truck-xl',
// //     name: 'Truck XL',
// //     type: 'Extra Large Truck',
// //     year: '2021',
// //     description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
// //     image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// //     price: '$159/hour',
// //     laborPrice: '$30/hour per worker',
// //     rating: 4.8,
// //     capacity: '8000 lbs',
// //     features: [
// //       'Maximum cargo space',
// //       'Heavy duty hydraulic lift',
// //       'Commercial grade',
// //       'Cross-country capable',
// //       'Advanced safety systems',
// //       'Professional load management'
// //     ],
// //   },
// // };

// // const VehicleDetail = () => {
// //   const router = useRouter();
// //   const { id } = useLocalSearchParams();
// //   const dispatch = useDispatch();
// //   const vehicle = vehicleDetails[id as string];

// //   if (!vehicle) {
// //     return (
// //       <View style={styles.notFoundContainer}>
// //         <MaterialCommunityIcons name="car-off" size={64} color={COLORS.text.secondary} />
// //         <Text style={styles.notFoundText}>Vehicle not found</Text>
// //         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
// //           <Text style={styles.backButtonText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const renderStars = (rating: number) => {
// //     const stars = [];
// //     const fullStars = Math.floor(rating);
// //     const hasHalfStar = rating % 1 !== 0;

// //     for (let i = 0; i < fullStars; i++) {
// //       stars.push(<AntDesign key={`star-${i}`} name="star" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />);
// //     }
// //     if (hasHalfStar) {
// //       stars.push(<MaterialCommunityIcons key="star-half" name="star-half-full" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />);
// //     }
// //     const emptyStars = 5 - Math.ceil(rating);
// //     for (let i = 0; i < emptyStars; i++) {
// //       stars.push(<AntDesign key={`star-empty-${i}`} name="staro" size={20} color={COLORS.text.secondary} style={{ marginRight: 4 }} />);
// //     }
// //     return stars;
// //   };

// //   const handleBookVehicle = () => {
// //     dispatch(setSelectedVehicle(vehicle));
// //     dispatch(bookVehicle());
// //     router.push({
// //       pathname: '/(authenticated)/(tabs)/CalendarScreen',
// //       params: { id: vehicle.id },
// //     });
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" />
// //       <ScrollView style={styles.scrollView} bounces={false}>
// //         <View style={styles.header}>
// //           <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
// //             <MaterialCommunityIcons name="arrow-left" size={26} color={COLORS.primary} />
// //           </TouchableOpacity>
// //         </View>

// //         <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />

// //         <View style={styles.contentContainer}>
// //           <View style={styles.titleContainer}>
// //             <Text style={styles.name}>{vehicle.name}</Text>
// //             <View style={styles.ratingContainer}>
// //               <View style={styles.stars}>{renderStars(vehicle.rating)}</View>
// //               <Text style={styles.ratingText}>
// //                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// //               </Text>
// //             </View>
// //           </View>

// //           <View style={styles.infoCard}>
// //             <Text style={styles.infoText}>
// //               <Text style={styles.infoTitle}>Type:</Text> {vehicle.type} - {vehicle.year}
// //             </Text>
// //             <Text style={styles.infoText}>
// //               <Text style={styles.infoTitle}>Capacity:</Text> {vehicle.capacity}
// //             </Text>
// //             <Text style={styles.infoText}>
// //               <Text style={styles.infoTitle}>Description:</Text> {vehicle.description}
// //             </Text>
// //           </View>

// //           <View style={styles.priceContainer}>
// //             <Text style={styles.priceLabel}>Vehicle Rate</Text>
// //             <Text style={styles.priceValue}>{vehicle.price}</Text>
// //             <Text style={styles.priceSubtext}>Labor: {vehicle.laborPrice}</Text>
// //           </View>

// //           <View style={styles.featuresContainer}>
// //             <Text style={styles.featuresTitle}>Features</Text>
// //             {vehicle.features.map((feature, index) => (
// //               <Text key={index} style={styles.featureItem}>• {feature}</Text>
// //             ))}
// //           </View>

// //           <TouchableOpacity style={styles.bookButton} onPress={handleBookVehicle}>
// //             <Text style={styles.bookButtonText}>Book Now</Text>
// //             <MaterialCommunityIcons name="arrow-right" size={24} color="#000000" />
// //           </TouchableOpacity>
// //         </View>
// //       </ScrollView>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: COLORS.background },
// //   scrollView: { flex: 1 },
// //   header: { padding: 20, position: 'absolute', zIndex: 1, width: '100%' },
// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     backgroundColor: COLORS.overlay,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginTop: 14,
// //   },
// //   vehicleImage: { width: '100%', height: 300 },
// //   contentContainer: { padding: 20 },
// //   titleContainer: { marginBottom: 24 },
// //   name: { fontSize: 28, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 8 },
// //   ratingContainer: { flexDirection: 'row', alignItems: 'center' },
// //   stars: { flexDirection: 'row', marginRight: 8 },
// //   ratingText: { color: COLORS.text.secondary, fontSize: 14 },
// //   infoCard: {
// //     backgroundColor: COLORS.surface,
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 24,
// //     elevation: 2,
// //   },
// //   infoText: { fontSize: 16, color: COLORS.text.primary, marginVertical: 4 },
// //   infoTitle: { fontWeight: 'bold' },
// //   priceContainer: {
// //     backgroundColor: COLORS.surface,
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 24,
// //     elevation: 2,
// //     alignItems: 'center',
// //   },
// //   priceLabel: { fontSize: 14, color: COLORS.text.secondary },
// //   priceValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
// //   priceSubtext: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
// //   featuresContainer: { marginBottom: 24 },
// //   featuresTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 8 },
// //   featureItem: { fontSize: 14, color: COLORS.text.secondary, marginLeft: 10 },
// //   bookButton: {
// //     backgroundColor: COLORS.primary,
// //     borderRadius: 12,
// //     padding: 16,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     elevation: 3,
// //   },
// //   bookButtonText: { color: '#000000', fontSize: 18, fontWeight: '600', marginRight: 8 },
// //   notFoundContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //   notFoundText: { color: COLORS.text.primary, fontSize: 20, marginVertical: 16 },
// // });

// // export default VehicleDetail;




// // // import React from 'react';
// // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // import { useDispatch } from 'react-redux';
// // // import { bookVehicle, setSelectedVehicle } from '@/app/context/slices/navSlice';
// // // import { LinearGradient } from 'expo-linear-gradient';

// // // const { width } = Dimensions.get('window');

// // // interface Vehicle {
// // //   id: string;
// // //   name: string;
// // //   type: string;
// // //   image: string;
// // //   description: string;
// // //   capacity: string;
// // //   price: string;
// // // }

// // // interface VehicleDetail extends Vehicle {
// // //   year: string;
// // //   laborPrice: string;
// // //   rating: number;
// // //   features: string[];
// // // }

// // // const COLORS = {
// // //   background: '#1c1c1e',
// // //   surface: '#2c2c2e',
// // //   primary: '#1fd655',
// // //   text: {
// // //     primary: '#f5f5f7',
// // //     secondary: '#a1a1a3',
// // //   },
// // //   overlay: 'rgba(0,0,0,0.5)',
// // // };

// // // const vehicleDetails: Record<string, VehicleDetail> = {
// // //   'pickup-truck': {
// // //     id: 'pickup-truck',
// // //     name: 'Pick up Truck',
// // //     type: 'Full Size Truck',
// // //     year: '2020',
// // //     description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
// // //     image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // //     price: '$89/hour',
// // //     laborPrice: '$30/hour per worker',
// // //     rating: 4.5,
// // //     capacity: '2000 lbs',
// // //     features: [
// // //       'Spacious cargo bed',
// // //       'Heavy-duty capacity',
// // //       'Construction materials',
// // //       'Large furniture',
// // //       'Safety features',
// // //       'GPS tracking'
// // //     ],
// // //   },
// // //   'van': {
// // //     id: 'van',
// // //     name: 'Van',
// // //     type: 'Standard Van',
// // //     year: '2022',
// // //     description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
// // //     image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // //     price: '$99/hour',
// // //     laborPrice: '$30/hour per worker',
// // //     rating: 4.7,
// // //     capacity: '3000 lbs',
// // //     features: [
// // //       'Enclosed cargo space',
// // //       'Weather protection',
// // //       'Easy loading',
// // //       'Fuel efficient',
// // //       'Security features',
// // //       'Climate control'
// // //     ],
// // //   },
// // //   'truck': {
// // //     id: 'truck',
// // //     name: 'Truck',
// // //     type: 'Standard Truck',
// // //     year: '2021',
// // //     description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
// // //     image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // //     price: '$129/hour',
// // //     laborPrice: '$30/hour per worker',
// // //     rating: 4.6,
// // //     capacity: '5000 lbs',
// // //     features: [
// // //       'Massive cargo space',
// // //       'Hydraulic lift',
// // //       'Professional grade',
// // //       'Long distance ready',
// // //       'Advanced safety',
// // //       'Load securing system'
// // //     ],
// // //   },
// // //   'truck-xl': {
// // //     id: 'truck-xl',
// // //     name: 'Truck XL',
// // //     type: 'Extra Large Truck',
// // //     year: '2021',
// // //     description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
// // //     image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // //     price: '$159/hour',
// // //     laborPrice: '$30/hour per worker',
// // //     rating: 4.8,
// // //     capacity: '8000 lbs',
// // //     features: [
// // //       'Maximum cargo space',
// // //       'Heavy duty hydraulic lift',
// // //       'Commercial grade',
// // //       'Cross-country capable',
// // //       'Advanced safety systems',
// // //       'Professional load management'
// // //     ],
// // //   },
// // // };

// // // const VehicleDetail = () => {
// // //   const router = useRouter();
// // //   const { id } = useLocalSearchParams();
// // //   const dispatch = useDispatch();
// // //   const vehicle = vehicleDetails[id as string];

// // //   if (!vehicle) {
// // //     return (
// // //       <View style={styles.notFoundContainer}>
// // //         <MaterialCommunityIcons name="car-off" size={64} color={COLORS.text.secondary} />
// // //         <Text style={styles.notFoundText}>Vehicle not found</Text>
// // //         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
// // //           <Text style={styles.backButtonText}>Go Back</Text>
// // //         </TouchableOpacity>
// // //       </View>
// // //     );
// // //   }

// // //   const renderStars = (rating: number) => {
// // //     const stars = [];
// // //     const fullStars = Math.floor(rating);
// // //     const hasHalfStar = rating % 1 !== 0;

// // //     for (let i = 0; i < fullStars; i++) {
// // //       stars.push(
// // //         <AntDesign key={`star-${i}`} name="star" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />
// // //       );
// // //     }

// // //     if (hasHalfStar) {
// // //       stars.push(
// // //         <MaterialCommunityIcons key="star-half" name="star-half-full" size={20} color={COLORS.primary} style={{ marginRight: 4 }} />
// // //       );
// // //     }

// // //     const emptyStars = 5 - Math.ceil(rating);
// // //     for (let i = 0; i < emptyStars; i++) {
// // //       stars.push(
// // //         <AntDesign key={`star-empty-${i}`} name="staro" size={20} color={COLORS.text.secondary} style={{ marginRight: 4 }} />
// // //       );
// // //     }

// // //     return stars;
// // //   };

// // //   const handleBookVehicle = () => {
// // //     dispatch(setSelectedVehicle(vehicle));
// // //     dispatch(bookVehicle());
// // //     router.push({
// // //       pathname: '/(authenticated)/(tabs)/CalendarScreen',
// // //       params: {
// // //         id: vehicle.id,
// // //       }
// // //     });
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       <StatusBar barStyle="light-content" />
// // //       <ScrollView style={styles.scrollView} bounces={false}>
// // //         <View style={styles.header}>
// // //           <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
// // //             <MaterialCommunityIcons name="arrow-left" size={26} color={COLORS.primary} />
// // //           </TouchableOpacity>
// // //         </View>

// // //         <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />

// // //         <View style={styles.contentContainer}>
// // //           <View style={styles.titleContainer}>
// // //             <Text style={styles.name}>{vehicle.name}</Text>
// // //             <View style={styles.ratingContainer}>
// // //               <View style={styles.stars}>{renderStars(vehicle.rating)}</View>
// // //               <Text style={styles.ratingText}>
// // //                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // //               </Text>
// // //             </View>
// // //           </View>

// // //           <View style={styles.priceContainer}>
// // //             <View style={styles.priceInfo}>
// // //               <Text style={styles.priceLabel}>Vehicle Rate</Text>
// // //               <Text style={styles.priceValue}>{vehicle.price}</Text>
// // //               <Text style={styles.priceSubtext}>Labor: {vehicle.laborPrice}</Text>
// // //             </View>
// // //           </View>

// // //           <TouchableOpacity style={styles.bookButton} onPress={handleBookVehicle}>
// // //             <Text style={styles.bookButtonText}>Book Now</Text>
// // //             <MaterialCommunityIcons name="arrow-right" size={24} color="#000000" />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </ScrollView>
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: COLORS.background },
// // //   scrollView: { flex: 1 },
// // //   header: { padding: 20, position: 'absolute', zIndex: 1, width: '100%' },
// // //   backButton: {
// // //     width: 40,
// // //     height: 40,
// // //     borderRadius: 20,
// // //     backgroundColor: COLORS.overlay,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     marginTop: 14,
// // //   },
// // //   backButtonText: { color: COLORS.text.primary, fontSize: 16, fontWeight: '600' },
// // //   vehicleImage: { width: '100%', height: 300 },
// // //   contentContainer: { padding: 20 },
// // //   titleContainer: { marginBottom: 24 },
// // //   name: { fontSize: 28, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 8 },
// // //   ratingContainer: { flexDirection: 'row', alignItems: 'center' },
// // //   stars: { flexDirection: 'row', marginRight: 8 },
// // //   ratingText: { color: COLORS.text.secondary, fontSize: 14 },
// // //   priceContainer: {
// // //     backgroundColor: COLORS.surface,
// // //     borderRadius: 16,
// // //     padding: 16,
// // //     marginBottom: 24,
// // //     elevation: 2,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.25,
// // //     shadowRadius: 3.84,
// // //   },
// // //   priceInfo: { alignItems: 'center' },
// // //   priceLabel: { fontSize: 14, color: COLORS.text.secondary, marginBottom: 4 },
// // //   priceValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.text.primary, marginBottom: 4 },
// // //   priceSubtext: { fontSize: 14, color: COLORS.text.secondary },
// // //   bookButton: {
// // //     backgroundColor: COLORS.primary,
// // //     borderRadius: 12,
// // //     padding: 16,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     elevation: 3,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.25,
// // //     shadowRadius: 3.84,
// // //   },
// // //   bookButtonText: { color: '#000000', fontSize: 18, fontWeight: '600', marginRight: 8 },
// // //   notFoundContainer: {
// // //     flex: 1,
// // //     backgroundColor: COLORS.background,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     padding: 20,
// // //   },
// // //   notFoundText: { color: COLORS.text.primary, fontSize: 20, marginVertical: 16 },
// // // });

// // // export default VehicleDetail;



// // // // import React from 'react';
// // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // // import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // import { useDispatch } from 'react-redux'; // Import useDispatch
// // // // import { bookVehicle, setSelectedVehicle } from '@/app/context/slices/navSlice'; // Import Redux actions
// // // // import { LinearGradient } from 'expo-linear-gradient';

// // // // const { width } = Dimensions.get('window');

// // // // interface Vehicle {
// // // //   id: string;
// // // //   name: string;
// // // //   type: string;
// // // //   image: string;
// // // //   description: string;
// // // //   capacity: string;
// // // //   price: string;
// // // // }

// // // // interface VehicleDetail extends Vehicle {
// // // //   year: string;
// // // //   laborPrice: string;
// // // //   rating: number;
// // // //   features: string[];
// // // // }

// // // // const COLORS = {
// // // //   background: '#1c1c1e',
// // // //   surface: '#2c2c2e',
// // // //   primary: '#1fd655',
// // // //   text: {
// // // //     primary: '#f5f5f7',
// // // //     secondary: '#a1a1a3',
// // // //   },
// // // //   overlay: 'rgba(0,0,0,0.5)',
// // // // };

// // // // const vehicleDetails: Record<string, VehicleDetail> = {
// // // //   'pickup-truck': {
// // // //     id: 'pickup-truck',
// // // //     name: 'Pick up Truck',
// // // //     type: 'Full Size Truck',
// // // //     year: '2020',
// // // //     description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
// // // //     image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // //     price: '$89/hour',
// // // //     laborPrice: '$30/hour per worker',
// // // //     rating: 4.5,
// // // //     capacity: '2000 lbs',
// // // //     features: [
// // // //       'Spacious cargo bed',
// // // //       'Heavy-duty capacity',
// // // //       'Construction materials',
// // // //       'Large furniture',
// // // //       'Safety features',
// // // //       'GPS tracking'
// // // //     ],
// // // //   },
// // // //   'van': {
// // // //     id: 'van',
// // // //     name: 'Van',
// // // //     type: 'Standard Van',
// // // //     year: '2022',
// // // //     description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
// // // //     image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // //     price: '$99/hour',
// // // //     laborPrice: '$30/hour per worker',
// // // //     rating: 4.7,
// // // //     capacity: '3000 lbs',
// // // //     features: [
// // // //       'Enclosed cargo space',
// // // //       'Weather protection',
// // // //       'Easy loading',
// // // //       'Fuel efficient',
// // // //       'Security features',
// // // //       'Climate control'
// // // //     ],
// // // //   },
// // // //   'truck': {
// // // //     id: 'truck',
// // // //     name: 'Truck',
// // // //     type: 'Standard Truck',
// // // //     year: '2021',
// // // //     description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
// // // //     image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // //     price: '$129/hour',
// // // //     laborPrice: '$30/hour per worker',
// // // //     rating: 4.6,
// // // //     capacity: '5000 lbs',
// // // //     features: [
// // // //       'Massive cargo space',
// // // //       'Hydraulic lift',
// // // //       'Professional grade',
// // // //       'Long distance ready',
// // // //       'Advanced safety',
// // // //       'Load securing system'
// // // //     ],
// // // //   },
// // // //   'truck-xl': {
// // // //     id: 'truck-xl',
// // // //     name: 'Truck XL',
// // // //     type: 'Extra Large Truck',
// // // //     year: '2021',
// // // //     description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
// // // //     image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // //     price: '$159/hour',
// // // //     laborPrice: '$30/hour per worker',
// // // //     rating: 4.8,
// // // //     capacity: '8000 lbs',
// // // //     features: [
// // // //       'Maximum cargo space',
// // // //       'Heavy duty hydraulic lift',
// // // //       'Commercial grade',
// // // //       'Cross-country capable',
// // // //       'Advanced safety systems',
// // // //       'Professional load management'
// // // //     ],
// // // //   },
// // // // };


// // // // const VehicleDetail = () => {
// // // //   const router = useRouter();
// // // //   const { id } = useLocalSearchParams();
// // // //   const dispatch = useDispatch(); // Initialize dispatch
// // // //   const vehicle = vehicleDetails[id as string];

// // // //   if (!vehicle) {
// // // //     return (
// // // //       <View style={styles.notFoundContainer}>
// // // //         <MaterialCommunityIcons name="car-off" size={64} color={COLORS.text.secondary} />
// // // //         <Text style={styles.notFoundText}>Vehicle not found</Text>
// // // //         <TouchableOpacity 
// // // //           style={styles.backButton}
// // // //           onPress={() => router.back()}
// // // //         >
// // // //           <Text style={styles.backButtonText}>Go Back</Text>
// // // //         </TouchableOpacity>
// // // //       </View>
// // // //     );
// // // //   }

// // // //   const renderStars = (rating: number) => {
// // // //     const stars = [];
// // // //     const fullStars = Math.floor(rating);
// // // //     const hasHalfStar = rating % 1 !== 0;

// // // //     for (let i = 0; i < fullStars; i++) {
// // // //       stars.push(
// // // //         <AntDesign
// // // //           key={`star-${i}`}
// // // //           name="star"
// // // //           size={20}
// // // //           color={COLORS.primary}
// // // //           style={{ marginRight: 4 }}
// // // //         />
// // // //       );
// // // //     }

// // // //     if (hasHalfStar) {
// // // //       stars.push(
// // // //         <MaterialCommunityIcons
// // // //           key="star-half"
// // // //           name="star-half-full"
// // // //           size={20}
// // // //           color={COLORS.primary}
// // // //           style={{ marginRight: 4 }}
// // // //         />
// // // //       );
// // // //     }

// // // //     const emptyStars = 5 - Math.ceil(rating);
// // // //     for (let i = 0; i < emptyStars; i++) {
// // // //       stars.push(
// // // //         <AntDesign
// // // //           key={`star-empty-${i}`}
// // // //           name="staro"
// // // //           size={20}
// // // //           color={COLORS.text.secondary}
// // // //           style={{ marginRight: 4 }}
// // // //         />
// // // //       );
// // // //     }

// // // //     return stars;
// // // //   };

// // // //   const handleBookVehicle = () => {
// // // //     // Dispatch selected vehicle to Redux and save the booking
// // // //     dispatch(setSelectedVehicle(vehicle));
// // // //     dispatch(bookVehicle());

// // // //     // Navigate to the next screen or show a booking confirmation
// // // //     router.push({
// // // //       pathname: '/(authenticated)/(tabs)/CalendarScreen',
// // // //       params: {
// // // //         id: vehicle.id,
// // // //       }
// // // //     });
// // // //   };

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <StatusBar barStyle="light-content" />
      
// // // //       <ScrollView style={styles.scrollView} bounces={false}>
// // // //         <View style={styles.header}>
// // // //           <TouchableOpacity 
// // // //             style={styles.backButton}
// // // //             onPress={() => router.back()}
// // // //           >
// // // //             <MaterialCommunityIcons name="arrow-left" size={26} color='#1fd655' />
// // // //           </TouchableOpacity>
// // // //         </View>

// // // //         <Image
// // // //           source={{ uri: vehicle.image }}
// // // //           style={styles.vehicleImage}
// // // //           resizeMode="cover"
// // // //         />

// // // //         <View style={styles.contentContainer}>
// // // //           <View style={styles.titleContainer}>
// // // //             <Text style={styles.name}>{vehicle.name}</Text>
// // // //             <View style={styles.ratingContainer}>
// // // //               <View style={styles.stars}>
// // // //                 {renderStars(vehicle.rating)}
// // // //               </View>
// // // //               <Text style={styles.ratingText}>
// // // //                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // // //               </Text>
// // // //             </View>
// // // //           </View>

// // // //           {/* Info Cards, Description, and Features Sections */}

// // // //           <View style={styles.priceContainer}>
// // // //             <View style={styles.priceInfo}>
// // // //               <Text style={styles.priceLabel}>Vehicle Rate</Text>
// // // //               <Text style={styles.priceValue}>{vehicle.price}</Text>
// // // //               <Text style={styles.priceSubtext}>Labor: {vehicle.laborPrice}</Text>
// // // //             </View>
// // // //           </View>

// // // //           <TouchableOpacity 
// // // //             style={styles.bookButton}
// // // //             onPress={handleBookVehicle} // Updated to use the handler
// // // //           >
// // // //             <Text style={styles.bookButtonText}>Book Now</Text>
// // // //             <MaterialCommunityIcons name="arrow-right" size={24} color="#000000" />
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </ScrollView>
// // // //     </View>
// // // //   );
// // // // };


// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: COLORS.background,
// // // //   },
// // // //   scrollView: {
// // // //     flex: 1,
// // // //   },
// // // //   header: {
// // // //     padding: 20,
// // // //     position: 'absolute',
// // // //     zIndex: 1,
// // // //     width: '100%',
// // // //   },
// // // //   backButton: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     backgroundColor: COLORS.overlay,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     marginTop: 14,
// // // //   },
// // // //   backButtonText: {
// // // //     color: COLORS.text.primary,
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //   },
// // // //   vehicleImage: {
// // // //     width: '100%',
// // // //     height: 300,
// // // //   },
// // // //   contentContainer: {
// // // //     padding: 20,
// // // //   },
// // // //   titleContainer: {
// // // //     marginBottom: 24,
// // // //   },
// // // //   name: {
// // // //     fontSize: 28,
// // // //     fontWeight: 'bold',
// // // //     color: COLORS.text.primary,
// // // //     marginBottom: 8,
// // // //   },
// // // //   ratingContainer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //   },
// // // //   stars: {
// // // //     flexDirection: 'row',
// // // //     marginRight: 8,
// // // //   },
// // // //   ratingText: {
// // // //     color: COLORS.text.secondary,
// // // //     fontSize: 14,
// // // //   },
// // // //   infoCards: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     marginBottom: 24,
// // // //   },
// // // //   infoCard: {
// // // //     flex: 1,
// // // //     alignItems: 'center',
// // // //     backgroundColor: COLORS.surface,
// // // //     borderRadius: 16,
// // // //     padding: 16,
// // // //     marginHorizontal: 4,
// // // //     elevation: 2,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.25,
// // // //     shadowRadius: 3.84,
// // // //   },
// // // //   infoLabel: {
// // // //     color: COLORS.text.secondary,
// // // //     fontSize: 14,
// // // //     marginTop: 8,
// // // //   },
// // // //   infoValue: {
// // // //     color: COLORS.text.primary,
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //     marginTop: 4,
// // // //   },
// // // //   section: {
// // // //     marginBottom: 24,
// // // //   },
// // // //   sectionTitle: {
// // // //     fontSize: 20,
// // // //     fontWeight: '600',
// // // //     color: COLORS.text.primary,
// // // //     marginBottom: 12,
// // // //   },
// // // //   description: {
// // // //     fontSize: 16,
// // // //     color: COLORS.text.secondary,
// // // //     lineHeight: 24,
// // // //   },
// // // //   featuresGrid: {
// // // //     flexDirection: 'row',
// // // //     flexWrap: 'wrap',
// // // //   },
// // // //   featureItem: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     width: '50%',
// // // //     marginBottom: 16,
// // // //   },
// // // //   featureIcon: {
// // // //     marginRight: 8,
// // // //   },
// // // //   featureText: {
// // // //     color: COLORS.text.secondary,
// // // //     fontSize: 14,
// // // //     flex: 1,
// // // //   },
// // // //   priceContainer: {
// // // //     backgroundColor: COLORS.surface,
// // // //     borderRadius: 16,
// // // //     padding: 16,
// // // //     marginBottom: 24,
// // // //     elevation: 2,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.25,
// // // //     shadowRadius: 3.84,
// // // //   },
// // // //   priceInfo: {
// // // //     alignItems: 'center',
// // // //   },
// // // //   priceLabel: {
// // // //     fontSize: 14,
// // // //     color: COLORS.text.secondary,
// // // //     marginBottom: 4,
// // // //   },
// // // //   priceValue: {
// // // //     fontSize: 24,
// // // //     fontWeight: 'bold',
// // // //     color: COLORS.text.primary,
// // // //     marginBottom: 4,
// // // //   },
// // // //   priceSubtext: {
// // // //     fontSize: 14,
// // // //     color: COLORS.text.secondary,
// // // //   },
// // // //   bookButton: {
// // // //     backgroundColor: COLORS.primary,
// // // //     borderRadius: 12,
// // // //     padding: 16,
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     justifyContent: 'center',
// // // //     elevation: 3,
// // // //     shadowColor: '#000',
// // // //     shadowOffset: { width: 0, height: 2 },
// // // //     shadowOpacity: 0.25,
// // // //     shadowRadius: 3.84,
// // // //   },
// // // //   bookButtonText: {
// // // //     color: '#000000',
// // // //     fontSize: 18,
// // // //     fontWeight: '600',
// // // //     marginRight: 8,
// // // //   },
// // // //   notFoundContainer: {
// // // //     flex: 1,
// // // //     backgroundColor: COLORS.background,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     padding: 20,
// // // //   },
// // // //   notFoundText: {
// // // //     color: COLORS.text.primary,
// // // //     fontSize: 20,
// // // //     marginVertical: 16,
// // // //   },
// // // // });

// // // // export default VehicleDetail;




// // // // // import React from 'react';
// // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // // // import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // import { LinearGradient } from 'expo-linear-gradient';

// // // // // const { width } = Dimensions.get('window');

// // // // // // Interface from the vehicles screen
// // // // // interface Vehicle {
// // // // //   id: string;
// // // // //   name: string;
// // // // //   type: string;
// // // // //   image: string;
// // // // //   description: string;
// // // // //   capacity: string;
// // // // //   price: string;
// // // // // }

// // // // // // Extended interface for detailed view
// // // // // interface VehicleDetail extends Vehicle {
// // // // //   year: string;
// // // // //   laborPrice: string;
// // // // //   rating: number;
// // // // //   features: string[];
// // // // // }

// // // // // const COLORS = {
// // // // //   background: '#1c1c1e',
// // // // //   surface: '#2c2c2e',
// // // // //   primary: '#1fd655',
// // // // //   text: {
// // // // //     primary: '#f5f5f7',
// // // // //     secondary: '#a1a1a3',
// // // // //   },
// // // // //   overlay: 'rgba(0,0,0,0.5)',
// // // // // };

// // // // // const vehicleDetails: Record<string, VehicleDetail> = {
// // // // //   'pickup-truck': {
// // // // //     id: 'pickup-truck',
// // // // //     name: 'Pick up Truck',
// // // // //     type: 'Full Size Truck',
// // // // //     year: '2020',
// // // // //     description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
// // // // //     image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // //     price: '$89/hour',
// // // // //     laborPrice: '$30/hour per worker',
// // // // //     rating: 4.5,
// // // // //     capacity: '2000 lbs',
// // // // //     features: [
// // // // //       'Spacious cargo bed',
// // // // //       'Heavy-duty capacity',
// // // // //       'Construction materials',
// // // // //       'Large furniture',
// // // // //       'Safety features',
// // // // //       'GPS tracking'
// // // // //     ],
// // // // //   },
// // // // //   'van': {
// // // // //     id: 'van',
// // // // //     name: 'Van',
// // // // //     type: 'Standard Van',
// // // // //     year: '2022',
// // // // //     description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
// // // // //     image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // //     price: '$99/hour',
// // // // //     laborPrice: '$30/hour per worker',
// // // // //     rating: 4.7,
// // // // //     capacity: '3000 lbs',
// // // // //     features: [
// // // // //       'Enclosed cargo space',
// // // // //       'Weather protection',
// // // // //       'Easy loading',
// // // // //       'Fuel efficient',
// // // // //       'Security features',
// // // // //       'Climate control'
// // // // //     ],
// // // // //   },
// // // // //   'truck': {
// // // // //     id: 'truck',
// // // // //     name: 'Truck',
// // // // //     type: 'Standard Truck',
// // // // //     year: '2021',
// // // // //     description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
// // // // //     image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // //     price: '$129/hour',
// // // // //     laborPrice: '$30/hour per worker',
// // // // //     rating: 4.6,
// // // // //     capacity: '5000 lbs',
// // // // //     features: [
// // // // //       'Massive cargo space',
// // // // //       'Hydraulic lift',
// // // // //       'Professional grade',
// // // // //       'Long distance ready',
// // // // //       'Advanced safety',
// // // // //       'Load securing system'
// // // // //     ],
// // // // //   },
// // // // //   'truck-xl': {
// // // // //     id: 'truck-xl',
// // // // //     name: 'Truck XL',
// // // // //     type: 'Extra Large Truck',
// // // // //     year: '2021',
// // // // //     description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
// // // // //     image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // //     price: '$159/hour',
// // // // //     laborPrice: '$30/hour per worker',
// // // // //     rating: 4.8,
// // // // //     capacity: '8000 lbs',
// // // // //     features: [
// // // // //       'Maximum cargo space',
// // // // //       'Heavy duty hydraulic lift',
// // // // //       'Commercial grade',
// // // // //       'Cross-country capable',
// // // // //       'Advanced safety systems',
// // // // //       'Professional load management'
// // // // //     ],
// // // // //   },
// // // // // };

// // // // // const VehicleDetail = () => {
// // // // //   const router = useRouter();
// // // // //   const { id } = useLocalSearchParams();
  
// // // // //   const vehicle = vehicleDetails[id as string];

// // // // //   if (!vehicle) {
// // // // //     return (
// // // // //       <View style={styles.notFoundContainer}>
// // // // //         <MaterialCommunityIcons name="car-off" size={64} color={COLORS.text.secondary} />
// // // // //         <Text style={styles.notFoundText}>Vehicle not found</Text>
// // // // //         <TouchableOpacity 
// // // // //           style={styles.backButton}
// // // // //           onPress={() => router.back()}
// // // // //         >
// // // // //           <Text style={styles.backButtonText}>Go Back</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>
// // // // //     );
// // // // //   }

// // // // //   const renderStars = (rating: number) => {
// // // // //     const stars = [];
// // // // //     const fullStars = Math.floor(rating);
// // // // //     const hasHalfStar = rating % 1 !== 0;

// // // // //     // Add full stars
// // // // //     for (let i = 0; i < fullStars; i++) {
// // // // //       stars.push(
// // // // //         <AntDesign
// // // // //           key={`star-${i}`}
// // // // //           name="star"
// // // // //           size={20}
// // // // //           color={COLORS.primary}
// // // // //           style={{ marginRight: 4 }}
// // // // //         />
// // // // //       );
// // // // //     }

// // // // //     // Add half star if needed
// // // // //     if (hasHalfStar) {
// // // // //       stars.push(
// // // // //         <MaterialCommunityIcons
// // // // //           key="star-half"
// // // // //           name="star-half-full"
// // // // //           size={20}
// // // // //           color={COLORS.primary}
// // // // //           style={{ marginRight: 4 }}
// // // // //         />
// // // // //       );
// // // // //     }

// // // // //     // Add empty stars
// // // // //     const emptyStars = 5 - Math.ceil(rating);
// // // // //     for (let i = 0; i < emptyStars; i++) {
// // // // //       stars.push(
// // // // //         <AntDesign
// // // // //           key={`star-empty-${i}`}
// // // // //           name="staro"
// // // // //           size={20}
// // // // //           color={COLORS.text.secondary}
// // // // //           style={{ marginRight: 4 }}
// // // // //         />
// // // // //       );
// // // // //     }

// // // // //     return stars;
// // // // //   };

// // // // //   return (
// // // // //     <View style={styles.container}>
// // // // //       <StatusBar barStyle="light-content" />
      
// // // // //       <ScrollView style={styles.scrollView} bounces={false}>
// // // // //         <View style={styles.header}>
// // // // //           <TouchableOpacity 
// // // // //             style={styles.backButton}
// // // // //             onPress={() => router.back()}
// // // // //           >
// // // // //             <MaterialCommunityIcons name="arrow-left" size={26} color='#1fd655' />
// // // // //           </TouchableOpacity>
// // // // //         </View>

// // // // //         <Image
// // // // //           source={{ uri: vehicle.image }}
// // // // //           style={styles.vehicleImage}
// // // // //           resizeMode="cover"
// // // // //         />

// // // // //         <View style={styles.contentContainer}>
// // // // //           <View style={styles.titleContainer}>
// // // // //             <Text style={styles.name}>{vehicle.name}</Text>
// // // // //             <View style={styles.ratingContainer}>
// // // // //               <View style={styles.stars}>
// // // // //                 {renderStars(vehicle.rating)}
// // // // //               </View>
// // // // //               <Text style={styles.ratingText}>
// // // // //                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // // // //               </Text>
// // // // //             </View>
// // // // //           </View>

// // // // //           <View style={styles.infoCards}>
// // // // //             <View style={styles.infoCard}>
// // // // //               <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
// // // // //               <Text style={styles.infoLabel}>Year</Text>
// // // // //               <Text style={styles.infoValue}>{vehicle.year}</Text>
// // // // //             </View>

// // // // //             <View style={styles.infoCard}>
// // // // //               <MaterialCommunityIcons name="weight" size={24} color={COLORS.primary} />
// // // // //               <Text style={styles.infoLabel}>Capacity</Text>
// // // // //               <Text style={styles.infoValue}>{vehicle.capacity}</Text>
// // // // //             </View>

// // // // //             <View style={styles.infoCard}>
// // // // //               <MaterialCommunityIcons name="truck" size={24} color={COLORS.primary} />
// // // // //               <Text style={styles.infoLabel}>Type</Text>
// // // // //               <Text style={styles.infoValue}>{vehicle.type}</Text>
// // // // //             </View>
// // // // //           </View>

// // // // //           <View style={styles.section}>
// // // // //             <Text style={styles.sectionTitle}>Description</Text>
// // // // //             <Text style={styles.description}>{vehicle.description}</Text>
// // // // //           </View>

// // // // //           <View style={styles.section}>
// // // // //             <Text style={styles.sectionTitle}>Features</Text>
// // // // //             <View style={styles.featuresGrid}>
// // // // //               {vehicle.features.map((feature, index) => (
// // // // //                 <View key={index} style={styles.featureItem}>
// // // // //                   <MaterialCommunityIcons 
// // // // //                     name="check-circle" 
// // // // //                     size={20} 
// // // // //                     color={COLORS.primary}
// // // // //                     style={styles.featureIcon}
// // // // //                   />
// // // // //                   <Text style={styles.featureText}>{feature}</Text>
// // // // //                 </View>
// // // // //               ))}
// // // // //             </View>
// // // // //           </View>

// // // // //           <View style={styles.priceContainer}>
// // // // //             <View style={styles.priceInfo}>
// // // // //               <Text style={styles.priceLabel}>Vehicle Rate</Text>
// // // // //               <Text style={styles.priceValue}>{vehicle.price}</Text>
// // // // //               <Text style={styles.priceSubtext}>Labor: {vehicle.laborPrice}</Text>
// // // // //             </View>
// // // // //           </View>

// // // // //           <TouchableOpacity 
// // // // //             style={styles.bookButton}
// // // // //             onPress={() => router.push({
// // // // //               // pathname: `/(authenticated)/(tabs)/CalendarScreen`,
// // // // //               pathname: '/(authenticated)/(tabs)/CalendarScreen',
// // // // //               params: {
// // // // //                 id: vehicle.id,
// // // // //                 // vehicleName: vehicle.name,
// // // // //               }
// // // // //             })}
// // // // //           >
// // // // //             <Text style={styles.bookButtonText}>Book Now</Text>
// // // // //             <MaterialCommunityIcons name="arrow-right" size={24} color="#000000" />
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </ScrollView>
// // // // //     </View>
// // // // //   );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //   container: {
// // // // //     flex: 1,
// // // // //     backgroundColor: COLORS.background,
// // // // //   },
// // // // //   scrollView: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   header: {
// // // // //     padding: 20,
// // // // //     position: 'absolute',
// // // // //     zIndex: 1,
// // // // //     width: '100%',
// // // // //   },
// // // // //   backButton: {
// // // // //     width: 40,
// // // // //     height: 40,
// // // // //     borderRadius: 20,
// // // // //     backgroundColor: COLORS.overlay,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     marginTop: 14,
// // // // //   },
// // // // //   backButtonText: {
// // // // //     color: COLORS.text.primary,
// // // // //     fontSize: 16,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   vehicleImage: {
// // // // //     width: '100%',
// // // // //     height: 300,
// // // // //   },
// // // // //   contentContainer: {
// // // // //     padding: 20,
// // // // //   },
// // // // //   titleContainer: {
// // // // //     marginBottom: 24,
// // // // //   },
// // // // //   name: {
// // // // //     fontSize: 28,
// // // // //     fontWeight: 'bold',
// // // // //     color: COLORS.text.primary,
// // // // //     marginBottom: 8,
// // // // //   },
// // // // //   ratingContainer: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   stars: {
// // // // //     flexDirection: 'row',
// // // // //     marginRight: 8,
// // // // //   },
// // // // //   ratingText: {
// // // // //     color: COLORS.text.secondary,
// // // // //     fontSize: 14,
// // // // //   },
// // // // //   infoCards: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     marginBottom: 24,
// // // // //   },
// // // // //   infoCard: {
// // // // //     flex: 1,
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: COLORS.surface,
// // // // //     borderRadius: 16,
// // // // //     padding: 16,
// // // // //     marginHorizontal: 4,
// // // // //     elevation: 2,
// // // // //     shadowColor: '#000',
// // // // //     shadowOffset: { width: 0, height: 2 },
// // // // //     shadowOpacity: 0.25,
// // // // //     shadowRadius: 3.84,
// // // // //   },
// // // // //   infoLabel: {
// // // // //     color: COLORS.text.secondary,
// // // // //     fontSize: 14,
// // // // //     marginTop: 8,
// // // // //   },
// // // // //   infoValue: {
// // // // //     color: COLORS.text.primary,
// // // // //     fontSize: 16,
// // // // //     fontWeight: '600',
// // // // //     marginTop: 4,
// // // // //   },
// // // // //   section: {
// // // // //     marginBottom: 24,
// // // // //   },
// // // // //   sectionTitle: {
// // // // //     fontSize: 20,
// // // // //     fontWeight: '600',
// // // // //     color: COLORS.text.primary,
// // // // //     marginBottom: 12,
// // // // //   },
// // // // //   description: {
// // // // //     fontSize: 16,
// // // // //     color: COLORS.text.secondary,
// // // // //     lineHeight: 24,
// // // // //   },
// // // // //   featuresGrid: {
// // // // //     flexDirection: 'row',
// // // // //     flexWrap: 'wrap',
// // // // //   },
// // // // //   featureItem: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     width: '50%',
// // // // //     marginBottom: 16,
// // // // //   },
// // // // //   featureIcon: {
// // // // //     marginRight: 8,
// // // // //   },
// // // // //   featureText: {
// // // // //     color: COLORS.text.secondary,
// // // // //     fontSize: 14,
// // // // //     flex: 1,
// // // // //   },
// // // // //   priceContainer: {
// // // // //     backgroundColor: COLORS.surface,
// // // // //     borderRadius: 16,
// // // // //     padding: 16,
// // // // //     marginBottom: 24,
// // // // //     elevation: 2,
// // // // //     shadowColor: '#000',
// // // // //     shadowOffset: { width: 0, height: 2 },
// // // // //     shadowOpacity: 0.25,
// // // // //     shadowRadius: 3.84,
// // // // //   },
// // // // //   priceInfo: {
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   priceLabel: {
// // // // //     fontSize: 14,
// // // // //     color: COLORS.text.secondary,
// // // // //     marginBottom: 4,
// // // // //   },
// // // // //   priceValue: {
// // // // //     fontSize: 24,
// // // // //     fontWeight: 'bold',
// // // // //     color: COLORS.text.primary,
// // // // //     marginBottom: 4,
// // // // //   },
// // // // //   priceSubtext: {
// // // // //     fontSize: 14,
// // // // //     color: COLORS.text.secondary,
// // // // //   },
// // // // //   bookButton: {
// // // // //     backgroundColor: COLORS.primary,
// // // // //     borderRadius: 12,
// // // // //     padding: 16,
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'center',
// // // // //     elevation: 3,
// // // // //     shadowColor: '#000',
// // // // //     shadowOffset: { width: 0, height: 2 },
// // // // //     shadowOpacity: 0.25,
// // // // //     shadowRadius: 3.84,
// // // // //   },
// // // // //   bookButtonText: {
// // // // //     color: '#000000',
// // // // //     fontSize: 18,
// // // // //     fontWeight: '600',
// // // // //     marginRight: 8,
// // // // //   },
// // // // //   notFoundContainer: {
// // // // //     flex: 1,
// // // // //     backgroundColor: COLORS.background,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     padding: 20,
// // // // //   },
// // // // //   notFoundText: {
// // // // //     color: COLORS.text.primary,
// // // // //     fontSize: 20,
// // // // //     marginVertical: 16,
// // // // //   },
// // // // // });

// // // // // export default VehicleDetail;



// // // // // // import React from 'react';
// // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // // // // import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
// // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // import { LinearGradient } from 'expo-linear-gradient';


// // // // // // const { width } = Dimensions.get('window');

// // // // // // // Interface from the vehicles screen
// // // // // // interface Vehicle {
// // // // // //   id: string;
// // // // // //   name: string;
// // // // // //   type: string;
// // // // // //   image: string;
// // // // // //   description: string;
// // // // // //   capacity: string;
// // // // // //   price: string;
// // // // // // }

// // // // // // // Extended interface for detailed view
// // // // // // interface VehicleDetail extends Vehicle {
// // // // // //   year: string;
// // // // // //   laborPrice: string;
// // // // // //   rating: number;
// // // // // //   features: string[];
// // // // // // }

// // // // // // const COLORS = {
// // // // // //   background: '#1c1c1e',
// // // // // //   surface: '#2c2c2e',
// // // // // //   primary: '#1fd655',
// // // // // //   text: {
// // // // // //     primary: '#f5f5f7',
// // // // // //     secondary: '#a1a1a3',
// // // // // //   },
// // // // // //   overlay: 'rgba(0,0,0,0.5)',
// // // // // // };

// // // // // // const vehicleDetails: Record<string, VehicleDetail> = {
// // // // // //   'pickup-truck': {
// // // // // //     id: 'pickup-truck',
// // // // // //     name: 'Pick up Truck',
// // // // // //     type: 'Full Size Truck',
// // // // // //     year: '2020',
// // // // // //     description: 'Perfect for small to medium moves and deliveries. A versatile and powerful truck suitable for heavy-duty tasks.',
// // // // // //     image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // //     price: '$89/hour',
// // // // // //     laborPrice: '$30/hour per worker',
// // // // // //     rating: 4.5,
// // // // // //     capacity: '2000 lbs',
// // // // // //     features: [
// // // // // //       'Spacious cargo bed',
// // // // // //       'Heavy-duty capacity',
// // // // // //       'Construction materials',
// // // // // //       'Large furniture',
// // // // // //       'Safety features',
// // // // // //       'GPS tracking'
// // // // // //     ],
// // // // // //   },
// // // // // //   'van': {
// // // // // //     id: 'van',
// // // // // //     name: 'Van',
// // // // // //     type: 'Standard Van',
// // // // // //     year: '2022',
// // // // // //     description: 'Ideal for moving apartments and small homes. Perfect balance of space and maneuverability.',
// // // // // //     image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // // //     price: '$99/hour',
// // // // // //     laborPrice: '$30/hour per worker',
// // // // // //     rating: 4.7,
// // // // // //     capacity: '3000 lbs',
// // // // // //     features: [
// // // // // //       'Enclosed cargo space',
// // // // // //       'Weather protection',
// // // // // //       'Easy loading',
// // // // // //       'Fuel efficient',
// // // // // //       'Security features',
// // // // // //       'Climate control'
// // // // // //     ],
// // // // // //   },
// // // // // //   'truck': {
// // // // // //     id: 'truck',
// // // // // //     name: 'Truck',
// // // // // //     type: 'Standard Truck',
// // // // // //     year: '2021',
// // // // // //     description: 'Great for moving homes and large items. Ideal for full home moves and commercial transportation needs.',
// // // // // //     image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // // //     price: '$129/hour',
// // // // // //     laborPrice: '$30/hour per worker',
// // // // // //     rating: 4.6,
// // // // // //     capacity: '5000 lbs',
// // // // // //     features: [
// // // // // //       'Massive cargo space',
// // // // // //       'Hydraulic lift',
// // // // // //       'Professional grade',
// // // // // //       'Long distance ready',
// // // // // //       'Advanced safety',
// // // // // //       'Load securing system'
// // // // // //     ],
// // // // // //   },
// // // // // //   'truck-xl': {
// // // // // //     id: 'truck-xl',
// // // // // //     name: 'Truck XL',
// // // // // //     type: 'Extra Large Truck',
// // // // // //     year: '2021',
// // // // // //     description: 'Largest option for big moves and commercial use. Perfect for full home and office relocations.',
// // // // // //     image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // // //     price: '$159/hour',
// // // // // //     laborPrice: '$30/hour per worker',
// // // // // //     rating: 4.8,
// // // // // //     capacity: '8000 lbs',
// // // // // //     features: [
// // // // // //       'Maximum cargo space',
// // // // // //       'Heavy duty hydraulic lift',
// // // // // //       'Commercial grade',
// // // // // //       'Cross-country capable',
// // // // // //       'Advanced safety systems',
// // // // // //       'Professional load management'
// // // // // //     ],
// // // // // //   },
// // // // // // };

// // // // // // const VehicleDetail = () => {
// // // // // //   const router = useRouter();
// // // // // //   const { id } = useLocalSearchParams();
  
// // // // // //   const vehicle = vehicleDetails[id as string];

// // // // // //   if (!vehicle) {
// // // // // //     return (
// // // // // //       <View style={styles.notFoundContainer}>
// // // // // //         <MaterialCommunityIcons name="car-off" size={64} color={COLORS.text.secondary} />
// // // // // //         <Text style={styles.notFoundText}>Vehicle not found</Text>
// // // // // //         <TouchableOpacity 
// // // // // //           style={styles.backButton}
// // // // // //           onPress={() => router.back()}
// // // // // //         >
// // // // // //           <Text style={styles.backButtonText}>Go Back</Text>
// // // // // //         </TouchableOpacity>
// // // // // //       </View>
// // // // // //     );
// // // // // //   }

// // // // // //   const renderStars = (rating: number) => {
// // // // // //     return Array.from({ length: 5 }, (_, i) => (
// // // // // //       <AntDesign
// // // // // //         key={i}
// // // // // //         name={i < Math.floor(rating) ? "star" : i < rating ? "starhalf" : "staro"}
// // // // // //         size={20}
// // // // // //         color={i < rating ? COLORS.primary : COLORS.text.secondary}
// // // // // //         style={{ marginRight: 4 }}
// // // // // //       />
// // // // // //     ));
// // // // // //   };

// // // // // //   return (
// // // // // //     <View style={styles.container}>
// // // // // //       <StatusBar barStyle="light-content" />
      
// // // // // //       <ScrollView style={styles.scrollView} bounces={false}>
// // // // // //         <View style={styles.header}>
// // // // // //           <TouchableOpacity 
// // // // // //             style={styles.backButton}
// // // // // //             onPress={() => router.back()}
// // // // // //           >
// // // // // //             <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text.primary} />
// // // // // //           </TouchableOpacity>
// // // // // //         </View>

// // // // // //         <Image
// // // // // //           source={{ uri: vehicle.image }}
// // // // // //           style={styles.vehicleImage}
// // // // // //           resizeMode="cover"
// // // // // //         />

// // // // // //         <View style={styles.contentContainer}>
// // // // // //           <View style={styles.titleContainer}>
// // // // // //             <Text style={styles.name}>{vehicle.name}</Text>
// // // // // //             <View style={styles.ratingContainer}>
// // // // // //               <View style={styles.stars}>
// // // // // //                 {renderStars(vehicle.rating)}
// // // // // //               </View>
// // // // // //               <Text style={styles.ratingText}>
// // // // // //                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // // // // //               </Text>
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           <View style={styles.infoCards}>
// // // // // //             <View style={styles.infoCard}>
// // // // // //               <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
// // // // // //               <Text style={styles.infoLabel}>Year</Text>
// // // // // //               <Text style={styles.infoValue}>{vehicle.year}</Text>
// // // // // //             </View>

// // // // // //             <View style={styles.infoCard}>
// // // // // //               <MaterialCommunityIcons name="weight" size={24} color={COLORS.primary} />
// // // // // //               <Text style={styles.infoLabel}>Capacity</Text>
// // // // // //               <Text style={styles.infoValue}>{vehicle.capacity}</Text>
// // // // // //             </View>

// // // // // //             <View style={styles.infoCard}>
// // // // // //               <MaterialCommunityIcons name="truck" size={24} color={COLORS.primary} />
// // // // // //               <Text style={styles.infoLabel}>Type</Text>
// // // // // //               <Text style={styles.infoValue}>{vehicle.type}</Text>
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           <View style={styles.section}>
// // // // // //             <Text style={styles.sectionTitle}>Description</Text>
// // // // // //             <Text style={styles.description}>{vehicle.description}</Text>
// // // // // //           </View>

// // // // // //           <View style={styles.section}>
// // // // // //             <Text style={styles.sectionTitle}>Features</Text>
// // // // // //             <View style={styles.featuresGrid}>
// // // // // //               {vehicle.features.map((feature, index) => (
// // // // // //                 <View key={index} style={styles.featureItem}>
// // // // // //                   <MaterialCommunityIcons 
// // // // // //                     name="check-circle" 
// // // // // //                     size={20} 
// // // // // //                     color={COLORS.primary}
// // // // // //                     style={styles.featureIcon}
// // // // // //                   />
// // // // // //                   <Text style={styles.featureText}>{feature}</Text>
// // // // // //                 </View>
// // // // // //               ))}
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           <View style={styles.priceContainer}>
// // // // // //             <View style={styles.priceInfo}>
// // // // // //               <Text style={styles.priceLabel}>Vehicle Rate</Text>
// // // // // //               <Text style={styles.priceValue}>{vehicle.price}</Text>
// // // // // //               <Text style={styles.priceSubtext}>Labor: {vehicle.laborPrice}</Text>
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           <TouchableOpacity 
// // // // // //             style={styles.bookButton}
// // // // // //             onPress={() => router.push(`/booking/${vehicle.id}`)}
// // // // // //           >
// // // // // //             <Text style={styles.bookButtonText}>Book Now</Text>
// // // // // //             <MaterialCommunityIcons name="arrow-right" size={24} color="#000000" />
// // // // // //           </TouchableOpacity>
// // // // // //         </View>
// // // // // //       </ScrollView>
// // // // // //     </View>
// // // // // //   );
// // // // // // };

// // // // // // const styles = StyleSheet.create({
// // // // // //   container: {
// // // // // //     flex: 1,
// // // // // //     backgroundColor: COLORS.background,
// // // // // //   },
// // // // // //   scrollView: {
// // // // // //     flex: 1,
// // // // // //   },
// // // // // //   header: {
// // // // // //     padding: 20,
// // // // // //     position: 'absolute',
// // // // // //     zIndex: 1,
// // // // // //     width: '100%',
// // // // // //   },
// // // // // //   backButton: {
// // // // // //     width: 40,
// // // // // //     height: 40,
// // // // // //     borderRadius: 20,
// // // // // //     backgroundColor: COLORS.overlay,
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   backButtonText: {
// // // // // //     color: COLORS.text.primary,
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: '600',
// // // // // //   },
// // // // // //   vehicleImage: {
// // // // // //     width: '100%',
// // // // // //     height: 300,
// // // // // //   },
// // // // // //   contentContainer: {
// // // // // //     padding: 20,
// // // // // //   },
// // // // // //   titleContainer: {
// // // // // //     marginBottom: 24,
// // // // // //   },
// // // // // //   name: {
// // // // // //     fontSize: 28,
// // // // // //     fontWeight: 'bold',
// // // // // //     color: COLORS.text.primary,
// // // // // //     marginBottom: 8,
// // // // // //   },
// // // // // //   ratingContainer: {
// // // // // //     flexDirection: 'row',
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   stars: {
// // // // // //     flexDirection: 'row',
// // // // // //     marginRight: 8,
// // // // // //   },
// // // // // //   ratingText: {
// // // // // //     color: COLORS.text.secondary,
// // // // // //     fontSize: 14,
// // // // // //   },
// // // // // //   infoCards: {
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'space-between',
// // // // // //     marginBottom: 24,
// // // // // //   },
// // // // // //   infoCard: {
// // // // // //     flex: 1,
// // // // // //     alignItems: 'center',
// // // // // //     backgroundColor: COLORS.surface,
// // // // // //     borderRadius: 16,
// // // // // //     padding: 16,
// // // // // //     marginHorizontal: 4,
// // // // // //     elevation: 2,
// // // // // //     shadowColor: '#000',
// // // // // //     shadowOffset: { width: 0, height: 2 },
// // // // // //     shadowOpacity: 0.25,
// // // // // //     shadowRadius: 3.84,
// // // // // //   },
// // // // // //   infoLabel: {
// // // // // //     color: COLORS.text.secondary,
// // // // // //     fontSize: 14,
// // // // // //     marginTop: 8,
// // // // // //   },
// // // // // //   infoValue: {
// // // // // //     color: COLORS.text.primary,
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: '600',
// // // // // //     marginTop: 4,
// // // // // //   },
// // // // // //   section: {
// // // // // //     marginBottom: 24,
// // // // // //   },
// // // // // //   sectionTitle: {
// // // // // //     fontSize: 20,
// // // // // //     fontWeight: '600',
// // // // // //     color: COLORS.text.primary,
// // // // // //     marginBottom: 12,
// // // // // //   },
// // // // // //   description: {
// // // // // //     fontSize: 16,
// // // // // //     color: COLORS.text.secondary,
// // // // // //     lineHeight: 24,
// // // // // //   },
// // // // // //   featuresGrid: {
// // // // // //     flexDirection: 'row',
// // // // // //     flexWrap: 'wrap',
// // // // // //   },
// // // // // //   featureItem: {
// // // // // //     flexDirection: 'row',
// // // // // //     alignItems: 'center',
// // // // // //     width: '50%',
// // // // // //     marginBottom: 16,
// // // // // //   },
// // // // // //   featureIcon: {
// // // // // //     marginRight: 8,
// // // // // //   },
// // // // // //   featureText: {
// // // // // //     color: COLORS.text.secondary,
// // // // // //     fontSize: 14,
// // // // // //     flex: 1,
// // // // // //   },
// // // // // //   priceContainer: {
// // // // // //     backgroundColor: COLORS.surface,
// // // // // //     borderRadius: 16,
// // // // // //     padding: 16,
// // // // // //     marginBottom: 24,
// // // // // //     elevation: 2,
// // // // // //     shadowColor: '#000',
// // // // // //     shadowOffset: { width: 0, height: 2 },
// // // // // //     shadowOpacity: 0.25,
// // // // // //     shadowRadius: 3.84,
// // // // // //   },
// // // // // //   priceInfo: {
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   priceLabel: {
// // // // // //     fontSize: 14,
// // // // // //     color: COLORS.text.secondary,
// // // // // //     marginBottom: 4,
// // // // // //   },
// // // // // //   priceValue: {
// // // // // //     fontSize: 24,
// // // // // //     fontWeight: 'bold',
// // // // // //     color: COLORS.text.primary,
// // // // // //     marginBottom: 4,
// // // // // //   },
// // // // // //   priceSubtext: {
// // // // // //     fontSize: 14,
// // // // // //     color: COLORS.text.secondary,
// // // // // //   },
// // // // // //   bookButton: {
// // // // // //     backgroundColor: COLORS.primary,
// // // // // //     borderRadius: 12,
// // // // // //     padding: 16,
// // // // // //     flexDirection: 'row',
// // // // // //     alignItems: 'center',
// // // // // //     justifyContent: 'center',
// // // // // //     elevation: 3,
// // // // // //     shadowColor: '#000',
// // // // // //     shadowOffset: { width: 0, height: 2 },
// // // // // //     shadowOpacity: 0.25,
// // // // // //     shadowRadius: 3.84,
// // // // // //   },
// // // // // //   bookButtonText: {
// // // // // //     color: '#000000',
// // // // // //     fontSize: 18,
// // // // // //     fontWeight: '600',
// // // // // //     marginRight: 8,
// // // // // //   },
// // // // // //   notFoundContainer: {
// // // // // //     flex: 1,
// // // // // //     backgroundColor: COLORS.background,
// // // // // //     justifyContent: 'center',
// // // // // //     alignItems: 'center',
// // // // // //     padding: 20,
// // // // // //   },
// // // // // //   notFoundText: {
// // // // // //     color: COLORS.text.primary,
// // // // // //     fontSize: 20,
// // // // // //     marginVertical: 16,
// // // // // //   },
// // // // // // });

// // // // // // export default VehicleDetail;


// // // // // // // import React from 'react';
// // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
// // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // import { MaterialCommunityIcons } from '@expo/vector-icons';

// // // // // // // interface Vehicle {
// // // // // // //   id: string;
// // // // // // //   name: string;
// // // // // // //   type: string;
// // // // // // //   image: string;
// // // // // // //   description: string;
// // // // // // //   capacity: string;
// // // // // // //   price: string;
// // // // // // // }

// // // // // // // const VehicleDetailsScreen = () => {
// // // // // // //   const { id } = useLocalSearchParams();
// // // // // // //   const router = useRouter();

// // // // // // //   // In a real app, you would fetch this data from an API or store
// // // // // // //   const vehicles: { [key: string]: Vehicle } = {
// // // // // // //     'pickup-truck': {
// // // // // // //       id: 'pickup-truck',
// // // // // // //       name: 'Pick up Truck',
// // // // // // //       type: 'Year: 2020',
// // // // // // //       image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // //       description: 'Perfect for small to medium moves and deliveries',
// // // // // // //       capacity: '2000 lbs',
// // // // // // //       price: '$89/hour'
// // // // // // //     },
// // // // // // //     'van': {
// // // // // // //       id: 'van',
// // // // // // //       name: 'Van',
// // // // // // //       type: 'Type: Standard',
// // // // // // //       image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // // // //       description: 'Ideal for moving apartments and small homes',
// // // // // // //       capacity: '3000 lbs',
// // // // // // //       price: '$99/hour'
// // // // // // //     },
// // // // // // //     'truck': {
// // // // // // //       id: 'truck',
// // // // // // //       name: 'Truck',
// // // // // // //       type: 'Type: Standard',
// // // // // // //       image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // // // //       description: 'Great for moving homes and large items',
// // // // // // //       capacity: '5000 lbs',
// // // // // // //       price: '$129/hour'
// // // // // // //     },
// // // // // // //     'truck-xl': {
// // // // // // //       id: 'truck-xl',
// // // // // // //       name: 'Truck XL',
// // // // // // //       type: 'Type: Extra Large',
// // // // // // //       image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // // // //       description: 'Largest option for big moves and commercial use',
// // // // // // //       capacity: '8000 lbs',
// // // // // // //       price: '$159/hour'
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const vehicle = vehicles[id as string];

// // // // // // //   if (!vehicle) {
// // // // // // //     return (
// // // // // // //       <View style={styles.container}>
// // // // // // //         <Text style={styles.errorText}>Vehicle not found</Text>
// // // // // // //       </View>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   return (
// // // // // // //     <ScrollView style={styles.container}>
// // // // // // //       <StatusBar style="light" />
      
// // // // // // //       <View style={styles.header}>
// // // // // // //         <TouchableOpacity 
// // // // // // //           style={styles.backButton}
// // // // // // //           onPress={() => router.back()}
// // // // // // //         >
// // // // // // //           <MaterialCommunityIcons name="arrow-left" size={24} color="#f5f5f7" />
// // // // // // //         </TouchableOpacity>
// // // // // // //       </View>

// // // // // // //       <Image
// // // // // // //         source={{ uri: vehicle.image }}
// // // // // // //         style={styles.vehicleImage}
// // // // // // //         resizeMode="cover"
// // // // // // //       />

// // // // // // //       <View style={styles.contentContainer}>
// // // // // // //         <Text style={styles.name}>{vehicle.name}</Text>
// // // // // // //         <Text style={styles.type}>{vehicle.type}</Text>
        
// // // // // // //         <View style={styles.infoContainer}>
// // // // // // //           <View style={styles.infoItem}>
// // // // // // //             <MaterialCommunityIcons name="weight" size={24} color="#1fd655" />
// // // // // // //             <Text style={styles.infoLabel}>Capacity</Text>
// // // // // // //             <Text style={styles.infoValue}>{vehicle.capacity}</Text>
// // // // // // //           </View>
          
// // // // // // //           <View style={styles.infoItem}>
// // // // // // //             <MaterialCommunityIcons name="cash" size={24} color="#1fd655" />
// // // // // // //             <Text style={styles.infoLabel}>Price</Text>
// // // // // // //             <Text style={styles.infoValue}>{vehicle.price}</Text>
// // // // // // //           </View>
// // // // // // //         </View>

// // // // // // //         <Text style={styles.sectionTitle}>Description</Text>
// // // // // // //         <Text style={styles.description}>{vehicle.description}</Text>

// // // // // // //         <TouchableOpacity style={styles.bookButton}>
// // // // // // //           <Text style={styles.bookButtonText}>Book Now</Text>
// // // // // // //         </TouchableOpacity>
// // // // // // //       </View>
// // // // // // //     </ScrollView>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default VehicleDetailsScreen;

// // // // // // // const styles = StyleSheet.create({
// // // // // // //   container: {
// // // // // // //     flex: 1,
// // // // // // //     backgroundColor: '#1c1c1e',
// // // // // // //   },
// // // // // // //   header: {
// // // // // // //     padding: 20,
// // // // // // //     position: 'absolute',
// // // // // // //     zIndex: 1,
// // // // // // //     width: '100%',
// // // // // // //   },
// // // // // // //   backButton: {
// // // // // // //     width: 40,
// // // // // // //     height: 40,
// // // // // // //     borderRadius: 20,
// // // // // // //     backgroundColor: 'rgba(0,0,0,0.5)',
// // // // // // //     justifyContent: 'center',
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   vehicleImage: {
// // // // // // //     width: '100%',
// // // // // // //     height: 300,
// // // // // // //   },
// // // // // // //   contentContainer: {
// // // // // // //     padding: 20,
// // // // // // //   },
// // // // // // //   name: {
// // // // // // //     fontSize: 28,
// // // // // // //     fontWeight: 'bold',
// // // // // // //     color: '#f5f5f7',
// // // // // // //     marginBottom: 8,
// // // // // // //   },
// // // // // // //   type: {
// // // // // // //     fontSize: 16,
// // // // // // //     color: '#a1a1a3',
// // // // // // //     marginBottom: 24,
// // // // // // //   },
// // // // // // //   infoContainer: {
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'space-around',
// // // // // // //     backgroundColor: '#2c2c2e',
// // // // // // //     borderRadius: 16,
// // // // // // //     padding: 20,
// // // // // // //     marginBottom: 24,
// // // // // // //   },
// // // // // // //   infoItem: {
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   infoLabel: {
// // // // // // //     color: '#a1a1a3',
// // // // // // //     fontSize: 14,
// // // // // // //     marginTop: 8,
// // // // // // //     marginBottom: 4,
// // // // // // //   },
// // // // // // //   infoValue: {
// // // // // // //     color: '#f5f5f7',
// // // // // // //     fontSize: 16,
// // // // // // //     fontWeight: '600',
// // // // // // //   },
// // // // // // //   sectionTitle: {
// // // // // // //     fontSize: 20,
// // // // // // //     fontWeight: '600',
// // // // // // //     color: '#f5f5f7',
// // // // // // //     marginBottom: 12,
// // // // // // //   },
// // // // // // //   description: {
// // // // // // //     fontSize: 16,
// // // // // // //     color: '#a1a1a3',
// // // // // // //     lineHeight: 24,
// // // // // // //     marginBottom: 32,
// // // // // // //   },
// // // // // // //   bookButton: {
// // // // // // //     backgroundColor: '#1fd655',
// // // // // // //     borderRadius: 12,
// // // // // // //     padding: 16,
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   bookButtonText: {
// // // // // // //     color: '#000',
// // // // // // //     fontSize: 18,
// // // // // // //     fontWeight: '600',
// // // // // // //   },
// // // // // // //   errorText: {
// // // // // // //     color: '#f5f5f7',
// // // // // // //     fontSize: 18,
// // // // // // //     textAlign: 'center',
// // // // // // //     marginTop: 40,
// // // // // // //   },
// // // // // // // });



// // // // // // // // import React from 'react';
// // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // import { LinearGradient } from 'expo-linear-gradient';

// // // // // // // // const { width } = Dimensions.get('window');

// // // // // // // // // Constants for consistent theming
// // // // // // // // const COLORS = {
// // // // // // // //   primary: '#059669',
// // // // // // // //   primaryLight: '#10B981',
// // // // // // // //   secondary: '#111827',
// // // // // // // //   tertiary: '#4B5563',
// // // // // // // //   background: '#F9FAFB',
// // // // // // // //   surface: '#FFFFFF',
// // // // // // // //   border: '#E5E7EB',
// // // // // // // //   success: '#10B981',
// // // // // // // //   warning: '#F59E0B',
// // // // // // // //   error: '#EF4444',
// // // // // // // //   text: {
// // // // // // // //     primary: '#111827',
// // // // // // // //     secondary: '#4B5563',
// // // // // // // //     light: '#9CA3AF',
// // // // // // // //     white: '#FFFFFF',
// // // // // // // //   }
// // // // // // // // };

// // // // // // // // const SPACING = {
// // // // // // // //   xs: 4,
// // // // // // // //   sm: 8,
// // // // // // // //   md: 16,
// // // // // // // //   lg: 24,
// // // // // // // //   xl: 32,
// // // // // // // // };

// // // // // // // // const TYPOGRAPHY: any = {
// // // // // // // //   h1: {
// // // // // // // //     fontSize: 28,
// // // // // // // //     fontWeight: '700',
// // // // // // // //     lineHeight: 34,
// // // // // // // //   },
// // // // // // // //   h2: {
// // // // // // // //     fontSize: 20,
// // // // // // // //     fontWeight: '600',
// // // // // // // //     lineHeight: 28,
// // // // // // // //   },
// // // // // // // //   body: {
// // // // // // // //     fontSize: 16,
// // // // // // // //     lineHeight: 24,
// // // // // // // //   },
// // // // // // // //   caption: {
// // // // // // // //     fontSize: 14,
// // // // // // // //     lineHeight: 20,
// // // // // // // //   },
// // // // // // // // };

// // // // // // // // const VehicleDetail = () => {
// // // // // // // //   const router = useRouter();
// // // // // // // //   const { vehicleName } = useLocalSearchParams();

// // // // // // // //   const onPressContinueButton = () => {
// // // // // // // //     router.push(`/CalendarScreen?vehicleName=${vehicleName}`);
// // // // // // // //   };

// // // // // // // //   const onPressBack = () => {
// // // // // // // //     router.back();
// // // // // // // //   };

// // // // // // // //   const vehicleDetails = {
// // // // // // // //     'Pick up Truck': {
// // // // // // // //       year: '2020',
// // // // // // // //       type: 'Full Size Truck',
// // // // // // // //       description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // //       image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // // //       price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // //       rating: 4.5,
// // // // // // // //       features: [
// // // // // // // //         'Spacious cargo bed',
// // // // // // // //         '5,000 kg capacity',
// // // // // // // //         'Suitable for construction materials',
// // // // // // // //         'Perfect for large furniture',
// // // // // // // //         'Advanced safety features',
// // // // // // // //         'GPS tracking enabled'
// // // // // // // //       ],
// // // // // // // //     },
// // // // // // // //     // Add other vehicle details as needed...
// // // // // // // //   };

// // // // // // // //   const vehicle = vehicleName ? vehicleDetails[vehicleName as keyof typeof vehicleDetails] : null;

// // // // // // // // //   const vehicle = vehicleDetails[vehicleName as keyof typeof vehicleDetails];

// // // // // // // // //   if (!vehicle) {
// // // // // // // // //     return (
// // // // // // // // //       <View style={styles.notFoundContainer}>
// // // // // // // // //         <Text style={[TYPOGRAPHY.h2, { color: COLORS.text.primary }]}>
// // // // // // // // //           Vehicle not found
// // // // // // // // //         </Text>
// // // // // // // // //       </View>
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // if (!vehicle) {
// // // // // // // //     return (
// // // // // // // //         <View style={styles.notFoundContainer}>
// // // // // // // //             <Text style={styles.notFoundText}>Vehicle not found</Text>
// // // // // // // //             <TouchableOpacity onPress={() => router.push('/vehicles')} style={styles.goBackButton}>
// // // // // // // //                 <Text style={styles.goBackButtonText}>Go Back</Text>
// // // // // // // //             </TouchableOpacity>
// // // // // // // //         </View>
// // // // // // // //     );
// // // // // // // // }

// // // // // // // //   const renderStars = (rating: number) => {
// // // // // // // //     return Array.from({ length: 5 }, (_, i) => (
// // // // // // // //       <AntDesign
// // // // // // // //         key={i}
// // // // // // // //         name={i < rating ? "star" : "staro"}
// // // // // // // //         size={20}
// // // // // // // //         color={i < rating ? COLORS.warning : COLORS.border}
// // // // // // // //         style={{ marginRight: SPACING.xs }}
// // // // // // // //       />
// // // // // // // //     ));
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <>
// // // // // // // //       <StatusBar barStyle="light-content" />
// // // // // // // //       <ScrollView style={styles.scrollView} bounces={false}>
// // // // // // // //         <View style={styles.imageContainer}>
// // // // // // // //           <Image
// // // // // // // //             source={{ uri: vehicle.image }}
// // // // // // // //             style={styles.vehicleImage}
// // // // // // // //             resizeMode="cover"
// // // // // // // //           />
// // // // // // // //           <LinearGradient
// // // // // // // //             colors={['rgba(0,0,0,0.7)', 'transparent']}
// // // // // // // //             style={styles.gradientOverlay}
// // // // // // // //           />
// // // // // // // //           <TouchableOpacity
// // // // // // // //             onPress={onPressBack}
// // // // // // // //             style={styles.backButton}
// // // // // // // //             activeOpacity={0.7}
// // // // // // // //           >
// // // // // // // //             <AntDesign name="arrowleft" size={24} color={COLORS.primaryLight} />
// // // // // // // //           </TouchableOpacity>
// // // // // // // //         </View>

// // // // // // // //         <View style={styles.detailsContainer}>
// // // // // // // //           <View style={styles.headerContainer}>
// // // // // // // //             <Text style={[TYPOGRAPHY.h1, styles.title]}>{vehicleName}</Text>

// // // // // // // //             <View style={styles.ratingContainer}>
// // // // // // // //               <View style={styles.starsContainer}>
// // // // // // // //                 {renderStars(vehicle.rating)}
// // // // // // // //               </View>
// // // // // // // //               <Text style={[TYPOGRAPHY.caption, styles.ratingText]}>
// // // // // // // //                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // // // // // // //               </Text>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.badgesContainer}>
// // // // // // // //               <View style={styles.badge}>
// // // // // // // //                 <Text style={styles.badgeText}>Year: {vehicle.year}</Text>
// // // // // // // //               </View>
// // // // // // // //               <View style={styles.badge}>
// // // // // // // //                 <Text style={styles.badgeText}>{vehicle.type}</Text>
// // // // // // // //               </View>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.section}>
// // // // // // // //               <Text style={[TYPOGRAPHY.h2, styles.sectionTitle]}>Description</Text>
// // // // // // // //               <Text style={[TYPOGRAPHY.body, styles.descriptionText]}>
// // // // // // // //                 {vehicle.description}
// // // // // // // //               </Text>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.section}>
// // // // // // // //               <Text style={[TYPOGRAPHY.h2, styles.sectionTitle]}>Key Features</Text>
// // // // // // // //               <View style={styles.featuresGrid}>
// // // // // // // //                 {vehicle.features.map((feature, index) => (
// // // // // // // //                   <View key={index} style={styles.featureItem}>
// // // // // // // //                     <View style={styles.featureIconContainer}>
// // // // // // // //                       <AntDesign name="checkcircle" size={16} color={COLORS.success} />
// // // // // // // //                     </View>
// // // // // // // //                     <Text style={styles.featureText}>{feature}</Text>
// // // // // // // //                   </View>
// // // // // // // //                 ))}
// // // // // // // //               </View>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.priceSection}>
// // // // // // // //               <Text style={[TYPOGRAPHY.caption, styles.priceLabel]}>Price</Text>
// // // // // // // //               <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // //             </View>
// // // // // // // //           </View>

// // // // // // // //           <TouchableOpacity
// // // // // // // //             style={styles.continueButton}
// // // // // // // //             onPress={onPressContinueButton}
// // // // // // // //             activeOpacity={0.8}
// // // // // // // //           >
// // // // // // // //             <Text style={styles.continueButtonText}>BOOK NOW</Text>
// // // // // // // //             <AntDesign name="arrowright" size={20} color={COLORS.text.white} />
// // // // // // // //           </TouchableOpacity>
// // // // // // // //         </View>
// // // // // // // //       </ScrollView>
// // // // // // // //     </>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default VehicleDetail;

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //   scrollView: {
// // // // // // // //     backgroundColor: COLORS.background,
// // // // // // // //     flex: 1,
// // // // // // // //   },
// // // // // // // //   imageContainer: {
// // // // // // // //     position: 'relative',
// // // // // // // //     height: 320,
// // // // // // // //   },
// // // // // // // //   vehicleImage: {
// // // // // // // //     width: '100%',
// // // // // // // //     height: '100%',
// // // // // // // //   },
// // // // // // // //   gradientOverlay: {
// // // // // // // //     position: 'absolute',
// // // // // // // //     top: 0,
// // // // // // // //     left: 0,
// // // // // // // //     right: 0,
// // // // // // // //     height: 120,
// // // // // // // //   },
// // // // // // // //   backButton: {
// // // // // // // //     position: 'absolute',
// // // // // // // //     top: 44,
// // // // // // // //     left: SPACING.md,
// // // // // // // //     padding: SPACING.sm,
// // // // // // // //     backgroundColor: 'rgba(0, 0, 0, 0.3)',
// // // // // // // //     borderRadius: 8,
// // // // // // // //   },
// // // // // // // //   detailsContainer: {
// // // // // // // //     backgroundColor: COLORS.surface,
// // // // // // // //     borderTopLeftRadius: 24,
// // // // // // // //     borderTopRightRadius: 24,
// // // // // // // //     marginTop: -24,
// // // // // // // //     paddingHorizontal: SPACING.md,
// // // // // // // //     paddingTop: SPACING.lg,
// // // // // // // //     paddingBottom: SPACING.xl,
// // // // // // // //     elevation: 6,
// // // // // // // //   },
// // // // // // // //   headerContainer: {
// // // // // // // //     marginBottom: SPACING.lg,
// // // // // // // //   },
// // // // // // // //   title: {
// // // // // // // //     color: COLORS.text.primary,
// // // // // // // //     marginBottom: SPACING.sm,
// // // // // // // //   },
// // // // // // // //   ratingContainer: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     marginBottom: SPACING.md,
// // // // // // // //   },
// // // // // // // //   starsContainer: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     marginRight: SPACING.sm,
// // // // // // // //   },
// // // // // // // //   ratingText: {
// // // // // // // //     color: COLORS.text.secondary,
// // // // // // // //     marginLeft: SPACING.xs,
// // // // // // // //   },
// // // // // // // //   badgesContainer: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     marginBottom: SPACING.md,
// // // // // // // //   },
// // // // // // // //   badge: {
// // // // // // // //     backgroundColor: COLORS.border,
// // // // // // // //     paddingHorizontal: SPACING.md,
// // // // // // // //     paddingVertical: SPACING.xs,
// // // // // // // //     borderRadius: 16,
// // // // // // // //     marginRight: SPACING.sm,
// // // // // // // //   },
// // // // // // // //   badgeText: {
// // // // // // // //     color: COLORS.text.secondary,
// // // // // // // //     fontWeight: '500',
// // // // // // // //   },
// // // // // // // //   section: {
// // // // // // // //     marginBottom: SPACING.lg,
// // // // // // // //   },
// // // // // // // //   sectionTitle: {
// // // // // // // //     color: COLORS.text.primary,
// // // // // // // //     marginBottom: SPACING.sm,
// // // // // // // //   },
// // // // // // // //   descriptionText: {
// // // // // // // //     color: COLORS.text.secondary,
// // // // // // // //   },
// // // // // // // //   featuresGrid: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     flexWrap: 'wrap',
// // // // // // // //     marginHorizontal: -SPACING.sm,
// // // // // // // //   },
// // // // // // // //   featureItem: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     width: '50%',
// // // // // // // //     paddingHorizontal: SPACING.sm,
// // // // // // // //     marginBottom: SPACING.md,
// // // // // // // //   },
// // // // // // // //   featureIconContainer: {
// // // // // // // //     width: 28,
// // // // // // // //     height: 28,
// // // // // // // //     borderRadius: 14,
// // // // // // // //     backgroundColor: 'rgba(0, 128, 0, 0.1)',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     justifyContent: 'center',
// // // // // // // //     marginRight: SPACING.sm,
// // // // // // // //   },
// // // // // // // //   featureText: {
// // // // // // // //     color: COLORS.text.secondary,
// // // // // // // //   },
// // // // // // // //   priceSection: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     justifyContent: 'space-between',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     marginBottom: SPACING.lg,
// // // // // // // //   },
// // // // // // // //   priceLabel: {
// // // // // // // //     color: COLORS.text.secondary,
// // // // // // // //   },
// // // // // // // //   priceText: {
// // // // // // // //     ...TYPOGRAPHY.h2,
// // // // // // // //     color: COLORS.primary,
// // // // // // // //     fontWeight: '700',
// // // // // // // //   },
// // // // // // // //   continueButton: {
// // // // // // // //     flexDirection: 'row',
// // // // // // // //     justifyContent: 'center',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     backgroundColor: COLORS.primary,
// // // // // // // //     paddingVertical: SPACING.md,
// // // // // // // //     borderRadius: 10,
// // // // // // // //   },
// // // // // // // //   continueButtonText: {
// // // // // // // //     color: COLORS.text.white,
// // // // // // // //     marginRight: SPACING.sm,
// // // // // // // //     fontSize: TYPOGRAPHY.h2.fontSize,
// // // // // // // //     fontWeight: '600',
// // // // // // // //   },
// // // // // // // // //   notFoundContainer: {
// // // // // // // // //     flex: 1,
// // // // // // // // //     alignItems: 'center',
// // // // // // // // //     justifyContent: 'center',
// // // // // // // // //     backgroundColor: COLORS.background,
// // // // // // // // //   },
// // // // // // // //   notFoundContainer: {
// // // // // // // //     flex: 1,
// // // // // // // //     justifyContent: 'center',
// // // // // // // //     alignItems: 'center',
// // // // // // // //     padding: 20,
// // // // // // // //     backgroundColor: '#F9FAFB',
// // // // // // // // },
// // // // // // // // notFoundText: {
// // // // // // // //     fontSize: 20,
// // // // // // // //     color: '#4B5563',
// // // // // // // //     marginBottom: 10,
// // // // // // // // },
// // // // // // // // goBackButton: {
// // // // // // // //     backgroundColor: '#059669',
// // // // // // // //     paddingHorizontal: 16,
// // // // // // // //     paddingVertical: 8,
// // // // // // // //     borderRadius: 8,
// // // // // // // // },
// // // // // // // // goBackButtonText: {
// // // // // // // //     color: '#FFFFFF',
// // // // // // // //     fontWeight: '600',
// // // // // // // // },
// // // // // // // // });




// // // // // // // // // import React from 'react';
// // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // import { LinearGradient } from 'expo-linear-gradient';

// // // // // // // // // const { width } = Dimensions.get('window');

// // // // // // // // // // Constants for consistent theming
// // // // // // // // // const COLORS = {
// // // // // // // // //   primary: '#059669',
// // // // // // // // //   primaryLight: '#10B981',
// // // // // // // // //   secondary: '#111827',
// // // // // // // // //   tertiary: '#4B5563',
// // // // // // // // //   background: '#F9FAFB',
// // // // // // // // //   surface: '#FFFFFF',
// // // // // // // // //   border: '#E5E7EB',
// // // // // // // // //   success: '#10B981',
// // // // // // // // //   warning: '#F59E0B',
// // // // // // // // //   error: '#EF4444',
// // // // // // // // //   text: {
// // // // // // // // //     primary: '#111827',
// // // // // // // // //     secondary: '#4B5563',
// // // // // // // // //     tertiary: '#6B7280',
// // // // // // // // //     light: '#9CA3AF',
// // // // // // // // //     white: '#FFFFFF',
// // // // // // // // //   }
// // // // // // // // // };

// // // // // // // // // const SPACING = {
// // // // // // // // //   xs: 4,
// // // // // // // // //   sm: 8,
// // // // // // // // //   md: 16,
// // // // // // // // //   lg: 24,
// // // // // // // // //   xl: 32,
// // // // // // // // // };

// // // // // // // // // const TYPOGRAPHY: any = {
// // // // // // // // //   h1: {
// // // // // // // // //     fontSize: 28,
// // // // // // // // //     fontWeight: '700',
// // // // // // // // //     lineHeight: 34,
// // // // // // // // //   },
// // // // // // // // //   h2: {
// // // // // // // // //     fontSize: 20,
// // // // // // // // //     fontWeight: '600',
// // // // // // // // //     lineHeight: 28,
// // // // // // // // //   },
// // // // // // // // //   body: {
// // // // // // // // //     fontSize: 16,
// // // // // // // // //     lineHeight: 24,
// // // // // // // // //   },
// // // // // // // // //   caption: {
// // // // // // // // //     fontSize: 14,
// // // // // // // // //     lineHeight: 20,
// // // // // // // // //   },
// // // // // // // // // };

// // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // //     const router = useRouter();
// // // // // // // // //     const { vehicleName } = useLocalSearchParams();

// // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // //         router.push(`/CalendarScreen?vehicleName=${vehicleName}`);
// // // // // // // // //     };
    


// // // // // // // // //     const onPressBack = () => {
// // // // // // // // //         router.push(`/(authenticated)/(tabs)/vehicles?vehicleName=${vehicleName}`);
// // // // // // // // //         router.back();
// // // // // // // // //     };

// // // // // // // // //         const vehicleDetails = {
// // // // // // // // //         'Pick up Truck': {
// // // // // // // // //             year: '2020',
// // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // //             image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // //             rating: 4.5,
// // // // // // // // //             features: [
// // // // // // // // //                 'Spacious cargo bed',
// // // // // // // // //                 '5,000 kg capacity',
// // // // // // // // //                 'Suitable for construction materials',
// // // // // // // // //                 'Perfect for large furniture',
// // // // // // // // //                 'Advanced safety features',
// // // // // // // // //                 'GPS tracking enabled'
// // // // // // // // //             ],
// // // // // // // // //         },
// // // // // // // // //         'Van': {
// // // // // // // // //             year: '2019',
// // // // // // // // //             type: 'Standard',
// // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // //             image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min',
// // // // // // // // //             rating: 4.0,
// // // // // // // // //             features: [
// // // // // // // // //                 'Easy loading access',
// // // // // // // // //                 'Seats up to 3 people',
// // // // // // // // //                 '2,000 kg capacity',
// // // // // // // // //                 'Ideal for city moves',
// // // // // // // // //                 'Fuel efficient',
// // // // // // // // //                 'Climate controlled'
// // // // // // // // //             ],
// // // // // // // // //         },
// // // // // // // // //         'Truck': {
// // // // // // // // //             year: '2018',
// // // // // // // // //             type: 'Standard',
// // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // //             image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min',
// // // // // // // // //             rating: 4.2,
// // // // // // // // //             features: [
// // // // // // // // //                 'Large storage space',
// // // // // // // // //                 'Fuel-efficient engine',
// // // // // // // // //                 '3,500 kg capacity',
// // // // // // // // //                 'Perfect for long moves',
// // // // // // // // //                 'Hydraulic lift gate',
// // // // // // // // //                 '24/7 roadside assistance'
// // // // // // // // //             ],
// // // // // // // // //         },
// // // // // // // // //         'Truck XL': {
// // // // // // // // //             year: '2021',
// // // // // // // // //             type: 'Extra Large',
// // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // //             image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min',
// // // // // // // // //             rating: 4.8,
// // // // // // // // //             features: [
// // // // // // // // //                 'Maximum loading capacity',
// // // // // // // // //                 'Heavy machinery compatible',
// // // // // // // // //                 'Industrial-grade durability',
// // // // // // // // //                 'Advanced suspension',
// // // // // // // // //                 'Multiple loading docks',
// // // // // // // // //                 'Real-time tracking'
// // // // // // // // //             ],
// // // // // // // // //         },
// // // // // // // // //     };

// // // // // // // // //     // const vehicleDetails = {
// // // // // // // // //     //     'Pick up Truck': {
// // // // // // // // //     //         year: '2020',
// // // // // // // // //     //         type: 'Full Size Truck',
// // // // // // // // //     //         description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // //     //         image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // // // //     //         price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // //     //         rating: 4.5,
// // // // // // // // //     //         features: [
// // // // // // // // //     //             'Spacious cargo bed',
// // // // // // // // //     //             '5,000 kg capacity',
// // // // // // // // //     //             'Suitable for construction materials',
// // // // // // // // //     //             'Perfect for large furniture',
// // // // // // // // //     //             'Advanced safety features',
// // // // // // // // //     //             'GPS tracking enabled'
// // // // // // // // //     //         ],
// // // // // // // // //     //     },
// // // // // // // // //     //     // ... other vehicle details remain the same
// // // // // // // // //     // };

// // // // // // // // //     const vehicle: any = vehicleDetails[vehicleName as keyof typeof vehicleDetails];

// // // // // // // // //     if (!vehicle) {
// // // // // // // // //         return (
// // // // // // // // //             <View style={styles.notFoundContainer}>
// // // // // // // // //                 <Text style={[TYPOGRAPHY.h2, { color: COLORS.text.primary }]}>
// // // // // // // // //                     Vehicle not found
// // // // // // // // //                 </Text>
// // // // // // // // //             </View>
// // // // // // // // //         );
// // // // // // // // //     }

// // // // // // // // //     const renderStars = (rating: number) => {
// // // // // // // // //         const stars = [];
// // // // // // // // //         for (let i = 1; i <= 5; i++) {
// // // // // // // // //             stars.push(
// // // // // // // // //                 <AntDesign
// // // // // // // // //                     key={i}
// // // // // // // // //                     name={i <= rating ? "star" : "staro"}
// // // // // // // // //                     size={20}
// // // // // // // // //                     color={i <= rating ? COLORS.warning : COLORS.border}
// // // // // // // // //                     style={{ marginRight: SPACING.xs }}
// // // // // // // // //                 />
// // // // // // // // //             );
// // // // // // // // //         }
// // // // // // // // //         return stars;
// // // // // // // // //     };

// // // // // // // // //     return (
// // // // // // // // //         <>
// // // // // // // // //             <StatusBar barStyle="light-content" />
// // // // // // // // //             <ScrollView style={styles.scrollView} bounces={false}>
// // // // // // // // //                 <View style={styles.imageContainer}>
// // // // // // // // //                     <Image 
// // // // // // // // //                         source={{ uri: vehicle.image }} 
// // // // // // // // //                         style={styles.vehicleImage} 
// // // // // // // // //                         resizeMode="cover"
// // // // // // // // //                     />
// // // // // // // // //                     <LinearGradient
// // // // // // // // //                         colors={['rgba(0,0,0,0.7)', 'transparent']}
// // // // // // // // //                         style={styles.gradientOverlay}
// // // // // // // // //                     />
// // // // // // // // //                     <TouchableOpacity 
// // // // // // // // //                         onPress={onPressBack} 
// // // // // // // // //                         style={styles.backButton}
// // // // // // // // //                         activeOpacity={0.7}
// // // // // // // // //                     >
// // // // // // // // //                         <AntDesign name="arrowleft" size={24} color="#1fd655" />
// // // // // // // // //                     </TouchableOpacity>
// // // // // // // // //                 </View>

// // // // // // // // //                 <View style={styles.detailsContainer}>
// // // // // // // // //                     <View style={styles.headerContainer}>
// // // // // // // // //                         <Text style={[TYPOGRAPHY.h1, styles.title]}>{vehicleName}</Text>
                        
// // // // // // // // //                         <View style={styles.ratingContainer}>
// // // // // // // // //                             <View style={styles.starsContainer}>
// // // // // // // // //                                 {renderStars(vehicle.rating)}
// // // // // // // // //                             </View>
// // // // // // // // //                             <Text style={[TYPOGRAPHY.caption, styles.ratingText]}>
// // // // // // // // //                                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // // // // // // // //                             </Text>
// // // // // // // // //                         </View>

// // // // // // // // //                         <View style={styles.badgesContainer}>
// // // // // // // // //                             <View style={styles.badge}>
// // // // // // // // //                                 <Text style={styles.badgeText}>Year: {vehicle.year}</Text>
// // // // // // // // //                             </View>
// // // // // // // // //                             <View style={styles.badge}>
// // // // // // // // //                                 <Text style={styles.badgeText}>{vehicle.type}</Text>
// // // // // // // // //                             </View>
// // // // // // // // //                         </View>

// // // // // // // // //                         <View style={styles.section}>
// // // // // // // // //                             <Text style={[TYPOGRAPHY.h2, styles.sectionTitle]}>Description</Text>
// // // // // // // // //                             <Text style={[TYPOGRAPHY.body, styles.descriptionText]}>
// // // // // // // // //                                 {vehicle.description}
// // // // // // // // //                             </Text>
// // // // // // // // //                         </View>

// // // // // // // // //                         <View style={styles.section}>
// // // // // // // // //                             <Text style={[TYPOGRAPHY.h2, styles.sectionTitle]}>Key Features</Text>
// // // // // // // // //                             <View style={styles.featuresGrid}>
// // // // // // // // //                                 {vehicle.features.map((feature: string, index: number) => (
// // // // // // // // //                                     <View key={index} style={styles.featureItem}>
// // // // // // // // //                                         <View style={styles.featureIconContainer}>
// // // // // // // // //                                             <AntDesign 
// // // // // // // // //                                                 name="checkcircle" 
// // // // // // // // //                                                 size={16} 
// // // // // // // // //                                                 color={COLORS.success} 
// // // // // // // // //                                             />
// // // // // // // // //                                         </View>
// // // // // // // // //                                         <Text style={styles.featureText}>{feature}</Text>
// // // // // // // // //                                     </View>
// // // // // // // // //                                 ))}
// // // // // // // // //                             </View>
// // // // // // // // //                         </View>

// // // // // // // // //                         <View style={styles.priceSection}>
// // // // // // // // //                             <Text style={[TYPOGRAPHY.caption, styles.priceLabel]}>Price</Text>
// // // // // // // // //                             <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // //                         </View>
// // // // // // // // //                     </View>

// // // // // // // // //                     <TouchableOpacity 
// // // // // // // // //                         style={styles.continueButton} 
// // // // // // // // //                         onPress={onPressContinueButton}
// // // // // // // // //                         activeOpacity={0.8}
// // // // // // // // //                     >
// // // // // // // // //                         <Text style={styles.continueButtonText}>BOOK NOW</Text>
// // // // // // // // //                         <AntDesign 
// // // // // // // // //                             name="arrowright" 
// // // // // // // // //                             size={20} 
// // // // // // // // //                             color={COLORS.text.white} 
// // // // // // // // //                             style={styles.buttonIcon} 
// // // // // // // // //                         />
// // // // // // // // //                     </TouchableOpacity>
// // // // // // // // //                 </View>
// // // // // // // // //             </ScrollView>
// // // // // // // // //         </>
// // // // // // // // //     );
// // // // // // // // // };

// // // // // // // // // export default VehicleDetail;

// // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // //     scrollView: {
// // // // // // // // //         backgroundColor: COLORS.background,
// // // // // // // // //         flex: 1,
// // // // // // // // //     },
// // // // // // // // //     imageContainer: {
// // // // // // // // //         position: 'relative',
// // // // // // // // //         height: 320,
// // // // // // // // //     },
// // // // // // // // //     vehicleImage: {
// // // // // // // // //         width: '100%',
// // // // // // // // //         height: '100%',
// // // // // // // // //         backgroundColor: COLORS.border,
// // // // // // // // //     },
// // // // // // // // //     gradientOverlay: {
// // // // // // // // //         position: 'absolute',
// // // // // // // // //         top: 0,
// // // // // // // // //         left: 0,
// // // // // // // // //         right: 0,
// // // // // // // // //         height: 120,
// // // // // // // // //     },
// // // // // // // // //     backButton: {
// // // // // // // // //         position: 'absolute',
// // // // // // // // //         top: 44,
// // // // // // // // //         left: SPACING.md,
// // // // // // // // //         padding: SPACING.sm,
// // // // // // // // //         borderRadius: 12,
// // // // // // // // //         backgroundColor: 'rgba(0, 0, 0, 0.3)',
// // // // // // // // //     },
// // // // // // // // //     detailsContainer: {
// // // // // // // // //         backgroundColor: COLORS.surface,
// // // // // // // // //         borderTopLeftRadius: 24,
// // // // // // // // //         borderTopRightRadius: 24,
// // // // // // // // //         marginTop: -24,
// // // // // // // // //         paddingHorizontal: SPACING.md,
// // // // // // // // //         paddingTop: SPACING.lg,
// // // // // // // // //         paddingBottom: SPACING.xl,
// // // // // // // // //         shadowColor: COLORS.secondary,
// // // // // // // // //         shadowOffset: {
// // // // // // // // //             width: 0,
// // // // // // // // //             height: -3,
// // // // // // // // //         },
// // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // //         shadowRadius: 4.65,
// // // // // // // // //         elevation: 6,
// // // // // // // // //     },
// // // // // // // // //     headerContainer: {
// // // // // // // // //         marginBottom: SPACING.lg,
// // // // // // // // //     },
// // // // // // // // //     title: {
// // // // // // // // //         color: COLORS.text.primary,
// // // // // // // // //         marginBottom: SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     badgesContainer: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         marginBottom: SPACING.md,
// // // // // // // // //     },
// // // // // // // // //     badge: {
// // // // // // // // //         backgroundColor: COLORS.border,
// // // // // // // // //         paddingHorizontal: SPACING.md,
// // // // // // // // //         paddingVertical: SPACING.xs,
// // // // // // // // //         borderRadius: 16,
// // // // // // // // //         marginRight: SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     badgeText: {
// // // // // // // // //         ...TYPOGRAPHY.caption,
// // // // // // // // //         color: COLORS.text.secondary,
// // // // // // // // //         fontWeight: '500',
// // // // // // // // //     },
// // // // // // // // //     ratingContainer: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         marginBottom: SPACING.md,
// // // // // // // // //     },
// // // // // // // // //     starsContainer: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         marginRight: SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     ratingText: {
// // // // // // // // //         color: COLORS.text.secondary,
// // // // // // // // //         marginLeft: SPACING.xs,
// // // // // // // // //     },
// // // // // // // // //     section: {
// // // // // // // // //         marginBottom: SPACING.lg,
// // // // // // // // //     },
// // // // // // // // //     sectionTitle: {
// // // // // // // // //         color: COLORS.text.primary,
// // // // // // // // //         marginBottom: SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     descriptionText: {
// // // // // // // // //         color: COLORS.text.secondary,
// // // // // // // // //     },
// // // // // // // // //     featuresGrid: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         flexWrap: 'wrap',
// // // // // // // // //         marginHorizontal: -SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     featureItem: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         width: '50%',
// // // // // // // // //         paddingHorizontal: SPACING.sm,
// // // // // // // // //         marginBottom: SPACING.md,
// // // // // // // // //     },
// // // // // // // // //     featureIconContainer: {
// // // // // // // // //         width: 28,
// // // // // // // // //         height: 28,
// // // // // // // // //         borderRadius: 14,
// // // // // // // // //         backgroundColor: COLORS.success + '10',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         justifyContent: 'center',
// // // // // // // // //         marginRight: SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     featureText: {
// // // // // // // // //         ...TYPOGRAPHY.caption,
// // // // // // // // //         color: COLORS.text.secondary,
// // // // // // // // //         flex: 1,
// // // // // // // // //     },
// // // // // // // // //     priceSection: {
// // // // // // // // //         backgroundColor: COLORS.background,
// // // // // // // // //         padding: SPACING.md,
// // // // // // // // //         borderRadius: 16,
// // // // // // // // //         marginTop: SPACING.sm,
// // // // // // // // //         borderWidth: 1,
// // // // // // // // //         borderColor: COLORS.border,
// // // // // // // // //     },
// // // // // // // // //     priceLabel: {
// // // // // // // // //         color: COLORS.text.tertiary,
// // // // // // // // //         marginBottom: SPACING.xs,
// // // // // // // // //     },
// // // // // // // // //     priceText: {
// // // // // // // // //         ...TYPOGRAPHY.h2,
// // // // // // // // //         color: COLORS.primary,
// // // // // // // // //         fontWeight: '700',
// // // // // // // // //     },
// // // // // // // // //     continueButton: {
// // // // // // // // //         backgroundColor: COLORS.primary,
// // // // // // // // //         borderRadius: 16,
// // // // // // // // //         paddingVertical: SPACING.md,
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         justifyContent: 'center',
// // // // // // // // //         shadowColor: COLORS.primary,
// // // // // // // // //         shadowOffset: {
// // // // // // // // //             width: 0,
// // // // // // // // //             height: 4,
// // // // // // // // //         },
// // // // // // // // //         shadowOpacity: 0.3,
// // // // // // // // //         shadowRadius: 4.65,
// // // // // // // // //         elevation: 8,
// // // // // // // // //     },
// // // // // // // // //     continueButtonText: {
// // // // // // // // //         color: COLORS.text.white,
// // // // // // // // //         fontSize: 18,
// // // // // // // // //         fontWeight: '600',
// // // // // // // // //         marginRight: SPACING.sm,
// // // // // // // // //     },
// // // // // // // // //     buttonIcon: {
// // // // // // // // //         marginLeft: SPACING.xs,
// // // // // // // // //     },
// // // // // // // // //     notFoundContainer: {
// // // // // // // // //         flex: 1,
// // // // // // // // //         justifyContent: 'center',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         backgroundColor: COLORS.background,
// // // // // // // // //         padding: SPACING.md,
// // // // // // // // //     },
// // // // // // // // // });



// // // // // // // // // // import React from 'react';
// // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
// // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // // import { LinearGradient } from 'expo-linear-gradient';

// // // // // // // // // // const { width } = Dimensions.get('window');

// // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // //     const router = useRouter();
// // // // // // // // // //     const { vehicleName } = useLocalSearchParams();

// // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // //         router.push('/CalendarScreen');
// // // // // // // // // //     };

// // // // // // // // // //     const onPressBack = () => {
// // // // // // // // // //         router.push('/(authenticated)/(tabs)/vehicles');
// // // // // // // // // //     };

// // // // // // // // // //     const vehicleDetails = {
// // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // //             year: '2020',
// // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // //             image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // // //             rating: 4.5,
// // // // // // // // // //             features: [
// // // // // // // // // //                 'Spacious cargo bed',
// // // // // // // // // //                 '5,000 kg capacity',
// // // // // // // // // //                 'Suitable for construction materials',
// // // // // // // // // //                 'Perfect for large furniture',
// // // // // // // // // //                 'Advanced safety features',
// // // // // // // // // //                 'GPS tracking enabled'
// // // // // // // // // //             ],
// // // // // // // // // //         },
// // // // // // // // // //         'Van': {
// // // // // // // // // //             year: '2019',
// // // // // // // // // //             type: 'Standard',
// // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // //             image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min',
// // // // // // // // // //             rating: 4.0,
// // // // // // // // // //             features: [
// // // // // // // // // //                 'Easy loading access',
// // // // // // // // // //                 'Seats up to 3 people',
// // // // // // // // // //                 '2,000 kg capacity',
// // // // // // // // // //                 'Ideal for city moves',
// // // // // // // // // //                 'Fuel efficient',
// // // // // // // // // //                 'Climate controlled'
// // // // // // // // // //             ],
// // // // // // // // // //         },
// // // // // // // // // //         'Truck': {
// // // // // // // // // //             year: '2018',
// // // // // // // // // //             type: 'Standard',
// // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // //             image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min',
// // // // // // // // // //             rating: 4.2,
// // // // // // // // // //             features: [
// // // // // // // // // //                 'Large storage space',
// // // // // // // // // //                 'Fuel-efficient engine',
// // // // // // // // // //                 '3,500 kg capacity',
// // // // // // // // // //                 'Perfect for long moves',
// // // // // // // // // //                 'Hydraulic lift gate',
// // // // // // // // // //                 '24/7 roadside assistance'
// // // // // // // // // //             ],
// // // // // // // // // //         },
// // // // // // // // // //         'Truck XL': {
// // // // // // // // // //             year: '2021',
// // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // //             image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min',
// // // // // // // // // //             rating: 4.8,
// // // // // // // // // //             features: [
// // // // // // // // // //                 'Maximum loading capacity',
// // // // // // // // // //                 'Heavy machinery compatible',
// // // // // // // // // //                 'Industrial-grade durability',
// // // // // // // // // //                 'Advanced suspension',
// // // // // // // // // //                 'Multiple loading docks',
// // // // // // // // // //                 'Real-time tracking'
// // // // // // // // // //             ],
// // // // // // // // // //         },
// // // // // // // // // //     };

// // // // // // // // // //     const vehicle: any = vehicleDetails[vehicleName as keyof typeof vehicleDetails];

// // // // // // // // // //     if (!vehicle) {
// // // // // // // // // //         return (
// // // // // // // // // //             <View style={styles.notFoundContainer}>
// // // // // // // // // //                 <Text style={styles.notFoundText}>Vehicle not found</Text>
// // // // // // // // // //             </View>
// // // // // // // // // //         );
// // // // // // // // // //     }

// // // // // // // // // //     const renderStars = (rating: number) => {
// // // // // // // // // //         const stars = [];
// // // // // // // // // //         for (let i = 1; i <= 5; i++) {
// // // // // // // // // //             stars.push(
// // // // // // // // // //                 <AntDesign
// // // // // // // // // //                     key={i}
// // // // // // // // // //                     name={i <= rating ? "star" : "staro"}
// // // // // // // // // //                     size={18}
// // // // // // // // // //                     color={i <= rating ? "#F59E0B" : "#D1D5DB"}
// // // // // // // // // //                     style={{ marginRight: 2 }}
// // // // // // // // // //                 />
// // // // // // // // // //             );
// // // // // // // // // //         }
// // // // // // // // // //         return stars;
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <>
// // // // // // // // // //             <StatusBar barStyle="light-content" />
// // // // // // // // // //             <ScrollView style={styles.scrollView} bounces={false}>
// // // // // // // // // //                 <View style={styles.imageContainer}>
// // // // // // // // // //                     <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
// // // // // // // // // //                     <LinearGradient
// // // // // // // // // //                         colors={['rgba(0,0,0,0.7)', 'transparent']}
// // // // // // // // // //                         style={styles.gradientOverlay}
// // // // // // // // // //                     />
// // // // // // // // // //                     <TouchableOpacity onPress={onPressBack} style={styles.backButton}>
// // // // // // // // // //                         <AntDesign name="arrowleft" size={24} color="white" />
// // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // //                 </View>

// // // // // // // // // //                 <View style={styles.detailsContainer}>
// // // // // // // // // //                     <View style={styles.headerContainer}>
// // // // // // // // // //                         <Text style={styles.title}>{vehicleName}</Text>
                        
// // // // // // // // // //                         <View style={styles.ratingContainer}>
// // // // // // // // // //                             <View style={styles.starsContainer}>
// // // // // // // // // //                                 {renderStars(vehicle.rating)}
// // // // // // // // // //                             </View>
// // // // // // // // // //                             <Text style={styles.ratingText}>
// // // // // // // // // //                                 {vehicle.rating} ({Math.floor(Math.random() * 300 + 100)} reviews)
// // // // // // // // // //                             </Text>
// // // // // // // // // //                         </View>

// // // // // // // // // //                         <View style={styles.badgesContainer}>
// // // // // // // // // //                             <View style={styles.badge}>
// // // // // // // // // //                                 <Text style={styles.badgeText}>Year: {vehicle.year}</Text>
// // // // // // // // // //                             </View>
// // // // // // // // // //                             <View style={styles.badge}>
// // // // // // // // // //                                 <Text style={styles.badgeText}>{vehicle.type}</Text>
// // // // // // // // // //                             </View>
// // // // // // // // // //                         </View>

// // // // // // // // // //                         <View style={styles.section}>
// // // // // // // // // //                             <Text style={styles.sectionTitle}>Description</Text>
// // // // // // // // // //                             <Text style={styles.descriptionText}>{vehicle.description}</Text>
// // // // // // // // // //                         </View>

// // // // // // // // // //                         <View style={styles.section}>
// // // // // // // // // //                             <Text style={styles.sectionTitle}>Key Features</Text>
// // // // // // // // // //                             <View style={styles.featuresGrid}>
// // // // // // // // // //                                 {vehicle.features.map((feature: string, index: number) => (
// // // // // // // // // //                                     <View key={index} style={styles.featureItem}>
// // // // // // // // // //                                         <AntDesign name="checkcircle" size={16} color="#10B981" />
// // // // // // // // // //                                         <Text style={styles.featureText}>{feature}</Text>
// // // // // // // // // //                                     </View>
// // // // // // // // // //                                 ))}
// // // // // // // // // //                             </View>
// // // // // // // // // //                         </View>

// // // // // // // // // //                         <View style={styles.priceSection}>
// // // // // // // // // //                             <Text style={styles.priceLabel}>Price</Text>
// // // // // // // // // //                             <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // // //                         </View>
// // // // // // // // // //                     </View>

// // // // // // // // // //                     <TouchableOpacity 
// // // // // // // // // //                         style={styles.continueButton} 
// // // // // // // // // //                         onPress={onPressContinueButton}
// // // // // // // // // //                         activeOpacity={0.8}
// // // // // // // // // //                     >
// // // // // // // // // //                         <Text style={styles.continueButtonText}>BOOK NOW</Text>
// // // // // // // // // //                         <AntDesign name="arrowright" size={20} color="white" style={styles.buttonIcon} />
// // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // //                 </View>
// // // // // // // // // //             </ScrollView>
// // // // // // // // // //         </>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // //     scrollView: {
// // // // // // // // // //         backgroundColor: '#F9FAFB',
// // // // // // // // // //         flex: 1,
// // // // // // // // // //     },
// // // // // // // // // //     imageContainer: {
// // // // // // // // // //         position: 'relative',
// // // // // // // // // //         height: 300,
// // // // // // // // // //     },
// // // // // // // // // //     vehicleImage: {
// // // // // // // // // //         width: '100%',
// // // // // // // // // //         height: '100%',
// // // // // // // // // //         backgroundColor: '#D1D5DB',
// // // // // // // // // //     },
// // // // // // // // // //     gradientOverlay: {
// // // // // // // // // //         position: 'absolute',
// // // // // // // // // //         top: 0,
// // // // // // // // // //         left: 0,
// // // // // // // // // //         right: 0,
// // // // // // // // // //         height: 100,
// // // // // // // // // //     },
// // // // // // // // // //     backButton: {
// // // // // // // // // //         position: 'absolute',
// // // // // // // // // //         top: 44,
// // // // // // // // // //         left: 20,
// // // // // // // // // //         padding: 8,
// // // // // // // // // //         borderRadius: 12,
// // // // // // // // // //         backgroundColor: 'rgba(0, 0, 0, 0.3)',
// // // // // // // // // //     },
// // // // // // // // // //     detailsContainer: {
// // // // // // // // // //         backgroundColor: '#F9FAFB',
// // // // // // // // // //         borderTopLeftRadius: 24,
// // // // // // // // // //         borderTopRightRadius: 24,
// // // // // // // // // //         marginTop: -24,
// // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // //         paddingTop: 24,
// // // // // // // // // //         paddingBottom: 40,
// // // // // // // // // //     },
// // // // // // // // // //     headerContainer: {
// // // // // // // // // //         marginBottom: 24,
// // // // // // // // // //     },
// // // // // // // // // //     title: {
// // // // // // // // // //         fontSize: 28,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         color: '#111827',
// // // // // // // // // //         marginBottom: 12,
// // // // // // // // // //     },
// // // // // // // // // //     badgesContainer: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         marginBottom: 16,
// // // // // // // // // //     },
// // // // // // // // // //     badge: {
// // // // // // // // // //         backgroundColor: '#E5E7EB',
// // // // // // // // // //         paddingHorizontal: 12,
// // // // // // // // // //         paddingVertical: 6,
// // // // // // // // // //         borderRadius: 16,
// // // // // // // // // //         marginRight: 8,
// // // // // // // // // //     },
// // // // // // // // // //     badgeText: {
// // // // // // // // // //         fontSize: 14,
// // // // // // // // // //         color: '#4B5563',
// // // // // // // // // //         fontWeight: '500',
// // // // // // // // // //     },
// // // // // // // // // //     ratingContainer: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         marginBottom: 16,
// // // // // // // // // //     },
// // // // // // // // // //     starsContainer: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         marginRight: 8,
// // // // // // // // // //     },
// // // // // // // // // //     ratingText: {
// // // // // // // // // //         fontSize: 14,
// // // // // // // // // //         color: '#4B5563',
// // // // // // // // // //         marginLeft: 4,
// // // // // // // // // //     },
// // // // // // // // // //     section: {
// // // // // // // // // //         marginBottom: 24,
// // // // // // // // // //     },
// // // // // // // // // //     sectionTitle: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: '600',
// // // // // // // // // //         color: '#111827',
// // // // // // // // // //         marginBottom: 12,
// // // // // // // // // //     },
// // // // // // // // // //     descriptionText: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         color: '#4B5563',
// // // // // // // // // //         lineHeight: 24,
// // // // // // // // // //     },
// // // // // // // // // //     featuresGrid: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         flexWrap: 'wrap',
// // // // // // // // // //         marginHorizontal: -8,
// // // // // // // // // //     },
// // // // // // // // // //     featureItem: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         width: '50%',
// // // // // // // // // //         paddingHorizontal: 8,
// // // // // // // // // //         marginBottom: 12,
// // // // // // // // // //     },
// // // // // // // // // //     featureText: {
// // // // // // // // // //         fontSize: 14,
// // // // // // // // // //         color: '#374151',
// // // // // // // // // //         marginLeft: 8,
// // // // // // // // // //         flex: 1,
// // // // // // // // // //     },
// // // // // // // // // //     priceSection: {
// // // // // // // // // //         backgroundColor: '#F3F4F6',
// // // // // // // // // //         padding: 16,
// // // // // // // // // //         borderRadius: 12,
// // // // // // // // // //         marginTop: 8,
// // // // // // // // // //     },
// // // // // // // // // //     priceLabel: {
// // // // // // // // // //         fontSize: 14,
// // // // // // // // // //         color: '#6B7280',
// // // // // // // // // //         marginBottom: 4,
// // // // // // // // // //     },
// // // // // // // // // //     priceText: {
// // // // // // // // // //         fontSize: 24,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         color: '#059669',
// // // // // // // // // //     },
// // // // // // // // // //     continueButton: {
// // // // // // // // // //         backgroundColor: '#059669',
// // // // // // // // // //         borderRadius: 16,
// // // // // // // // // //         paddingVertical: 16,
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         shadowColor: '#059669',
// // // // // // // // // //         shadowOffset: {
// // // // // // // // // //             width: 0,
// // // // // // // // // //             height: 4,
// // // // // // // // // //         },
// // // // // // // // // //         shadowOpacity: 0.3,
// // // // // // // // // //         shadowRadius: 4.65,
// // // // // // // // // //         elevation: 8,
// // // // // // // // // //     },
// // // // // // // // // //     continueButtonText: {
// // // // // // // // // //         color: 'white',
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: '600',
// // // // // // // // // //         marginRight: 8,
// // // // // // // // // //     },
// // // // // // // // // //     buttonIcon: {
// // // // // // // // // //         marginLeft: 4,
// // // // // // // // // //     },
// // // // // // // // // //     notFoundContainer: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         backgroundColor: '#F9FAFB',
// // // // // // // // // //         padding: 20,
// // // // // // // // // //     },
// // // // // // // // // //     notFoundText: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: '600',
// // // // // // // // // //         color: '#374151',
// // // // // // // // // //     },
// // // // // // // // // // });


// // // // // // // // // // // import React from 'react';
// // // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
// // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';

// // // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // //     const { vehicleName } = useLocalSearchParams();

// // // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // // //         router.push('/CalendarScreen');
// // // // // // // // // // //     };

// // // // // // // // // // //     const onPressBack = () => {
// // // // // // // // // // //         router.push('/(authenticated)/(tabs)/vehicles');
// // // // // // // // // // //     };

// // // // // // // // // // //     const vehicleDetails = {
// // // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // // //             year: '2020',
// // // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // // //             image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // // // //             rating: 4.5,
// // // // // // // // // // //             features: 'Spacious bed, 5,000 kg capacity, suitable for construction materials and large furniture.',
// // // // // // // // // // //         },
// // // // // // // // // // //         'Van': {
// // // // // // // // // // //             year: '2019',
// // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // // //             image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min',
// // // // // // // // // // //             rating: 4.0,
// // // // // // // // // // //             features: 'Easy to load, seats up to 3 people, 2,000 kg capacity, great for city moves.',
// // // // // // // // // // //         },
// // // // // // // // // // //         'Truck': {
// // // // // // // // // // //             year: '2018',
// // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // // //             image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min',
// // // // // // // // // // //             rating: 4.2,
// // // // // // // // // // //             features: 'Large storage, fuel-efficient, 3,500 kg capacity, ideal for both short and long moves.',
// // // // // // // // // // //         },
// // // // // // // // // // //         'Truck XL': {
// // // // // // // // // // //             year: '2021',
// // // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // // //             image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min',
// // // // // // // // // // //             rating: 4.8,
// // // // // // // // // // //             features: 'Max capacity, accommodates heavy machinery, perfect for industrial moves.',
// // // // // // // // // // //         },
// // // // // // // // // // //     };

// // // // // // // // // // //     const vehicle: any = vehicleDetails[vehicleName as any];

// // // // // // // // // // //     if (!vehicle) {
// // // // // // // // // // //         return (
// // // // // // // // // // //             <View style={styles.notFoundContainer}>
// // // // // // // // // // //                 <Text style={styles.notFoundText}>Vehicle not found</Text>
// // // // // // // // // // //             </View>
// // // // // // // // // // //         );
// // // // // // // // // // //     }

// // // // // // // // // // //     return (
// // // // // // // // // // //         <>
// // // // // // // // // // //             <StatusBar />
// // // // // // // // // // //             <ScrollView style={styles.scrollView}>
// // // // // // // // // // //                 <View style={styles.imageContainer}>
// // // // // // // // // // //                     <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
// // // // // // // // // // //                     <TouchableOpacity onPress={onPressBack} style={styles.backButton}>
// // // // // // // // // // //                         <AntDesign name="arrowleft" size={24} color="green" />
// // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // //                 </View>

// // // // // // // // // // //                 <View style={styles.detailsContainer}>
// // // // // // // // // // //                     <View style={styles.headerContainer}>
// // // // // // // // // // //                         <Text style={styles.title}>{vehicleName}</Text>
// // // // // // // // // // //                         <View style={styles.row}>
// // // // // // // // // // //                             <Text style={styles.detailText}>Year: {vehicle.year}</Text>
// // // // // // // // // // //                             <Text style={styles.detailText}>Type: {vehicle.type}</Text>
// // // // // // // // // // //                         </View>

// // // // // // // // // // //                         {/* Adding Ratings */}
// // // // // // // // // // //                         <View style={styles.ratingContainer}>
// // // // // // // // // // //                             <AntDesign name="star" size={18} color="#F59E0B" />
// // // // // // // // // // //                             <Text style={styles.ratingText}>{vehicle.rating} (200 reviews)</Text>
// // // // // // // // // // //                         </View>

// // // // // // // // // // //                         <Text style={styles.descriptionText}>{vehicle.description}</Text>

// // // // // // // // // // //                         {/* Vehicle Features */}
// // // // // // // // // // //                         <Text style={styles.featuresHeader}>Key Features:</Text>
// // // // // // // // // // //                         <Text style={styles.featuresText}>{vehicle.features}</Text>

// // // // // // // // // // //                         <Text style={styles.priceText}>Price: {vehicle.price}</Text>
// // // // // // // // // // //                     </View>

// // // // // // // // // // //                     {/* CTA Button */}
// // // // // // // // // // //                     <TouchableOpacity style={styles.continueButton} onPress={onPressContinueButton}>
// // // // // // // // // // //                         <Text style={styles.continueButtonText}>CONTINUE</Text>
// // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // //                 </View>
// // // // // // // // // // //             </ScrollView>
// // // // // // // // // // //         </>
// // // // // // // // // // //     );
// // // // // // // // // // // };

// // // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // //     scrollView: {
// // // // // // // // // // //         backgroundColor: 'white',
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //     },
// // // // // // // // // // //     imageContainer: {
// // // // // // // // // // //         position: 'relative',
// // // // // // // // // // //     },
// // // // // // // // // // //     vehicleImage: {
// // // // // // // // // // //         width: '100%',
// // // // // // // // // // //         height: 240,
// // // // // // // // // // //         backgroundColor: '#D1D5DB',
// // // // // // // // // // //     },
// // // // // // // // // // //     backButton: {
// // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // //         top: 36,
// // // // // // // // // // //         left: 20,
// // // // // // // // // // //         padding: 8,
// // // // // // // // // // //         backgroundColor: '#F3F4F6',
// // // // // // // // // // //         borderRadius: 9999,
// // // // // // // // // // //     },
// // // // // // // // // // //     detailsContainer: {
// // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // //         paddingHorizontal: 16,
// // // // // // // // // // //         paddingTop: 16,
// // // // // // // // // // //     },
// // // // // // // // // // //     headerContainer: {
// // // // // // // // // // //         paddingBottom: 20,
// // // // // // // // // // //     },
// // // // // // // // // // //     title: {
// // // // // // // // // // //         fontSize: 26,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         marginBottom: 8,
// // // // // // // // // // //     },
// // // // // // // // // // //     row: {
// // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //     },
// // // // // // // // // // //     detailText: {
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         color: '#6B7280',
// // // // // // // // // // //     },
// // // // // // // // // // //     ratingContainer: {
// // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //     },
// // // // // // // // // // //     ratingText: {
// // // // // // // // // // //         marginLeft: 5,
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         color: '#374151',
// // // // // // // // // // //     },
// // // // // // // // // // //     descriptionText: {
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         color: '#374151',
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //     },
// // // // // // // // // // //     featuresHeader: {
// // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         marginTop: 10,
// // // // // // // // // // //     },
// // // // // // // // // // //     featuresText: {
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         color: '#374151',
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //     },
// // // // // // // // // // //     priceText: {
// // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         color: '#F59E0B',
// // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // //     },
// // // // // // // // // // //     continueButton: {
// // // // // // // // // // //         backgroundColor: '#F59E0B',
// // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // //         paddingVertical: 14,
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     continueButtonText: {
// // // // // // // // // // //         color: 'white',
// // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //     },
// // // // // // // // // // //     notFoundContainer: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // //         padding: 20,
// // // // // // // // // // //     },
// // // // // // // // // // //     notFoundText: {
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         color: '#374151',
// // // // // // // // // // //     },
// // // // // // // // // // // });


// // // // // // // // // // // // import React from 'react';
// // // // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
// // // // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';
// // // // // // // // // // // // import ExpoStatusBar from 'expo-status-bar/build/ExpoStatusBar';

// // // // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // //     const { vehicleName } = useLocalSearchParams();

// // // // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // // // //         router.push('/CalendarScreen');
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const onPressBack = () => {
// // // // // // // // // // // //         router.push('/(authenticated)/(tabs)/vehicles');
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
// // // // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // // // //             year: '2020',
// // // // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // // // //             image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
// // // // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //         'Van': {
// // // // // // // // // // // //             year: '2019',
// // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // // // //             image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
// // // // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //         'Truck': {
// // // // // // // // // // // //             year: '2018',
// // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // // // //             image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
// // // // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //         'Truck XL': {
// // // // // // // // // // // //             year: '2021',
// // // // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // // // //             image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
// // // // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const vehicle = vehicleDetails[vehicleName as string];

// // // // // // // // // // // //     if (!vehicle) {
// // // // // // // // // // // //         return (
// // // // // // // // // // // //             <View style={{
// // // // // // // // // // // //                 flex: 1,
// // // // // // // // // // // //                 backgroundColor: '#fff',
// // // // // // // // // // // //                 padding: 20,
// // // // // // // // // // // //                 justifyContent: 'center',
// // // // // // // // // // // //                 alignItems: 'center',
// // // // // // // // // // // //                 paddingTop: StatusBar.currentHeight,
// // // // // // // // // // // //                 paddingBottom: 20,
 
// // // // // // // // // // // //             }}>
// // // // // // // // // // // //                 <Text style={{
// // // // // // // // // // // //                     fontSize: 16,
// // // // // // // // // // // //                     fontWeight: 'condensedBold'
// // // // // // // // // // // //                 }}>Vehicle not found</Text>
// // // // // // // // // // // //             </View>
// // // // // // // // // // // //         );
// // // // // // // // // // // //     }

// // // // // // // // // // // //     return (
// // // // // // // // // // // //         <>
// // // // // // // // // // // //             <ExpoStatusBar style='auto'/>
// // // // // // // // // // // //             <ScrollView style={styles.scrollView}>
// // // // // // // // // // // //                 <View style={styles.imageContainer}>
// // // // // // // // // // // //                     <Image 
// // // // // // // // // // // //                         source={{ uri: vehicle.image }}
// // // // // // // // // // // //                         style={styles.vehicleImage}
// // // // // // // // // // // //                     />
// // // // // // // // // // // //                     <TouchableOpacity onPress={onPressBack} style={styles.backButton}>
// // // // // // // // // // // //                         <AntDesign name='arrowleft' size={24} color='green' />
// // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // //                 </View>

// // // // // // // // // // // //                 <View style={styles.detailsContainer}>
// // // // // // // // // // // //                     <View style={styles.headerContainer}>
// // // // // // // // // // // //                         <Text style={styles.title}>{vehicleName}</Text>
// // // // // // // // // // // //                         <View style={styles.row}>
// // // // // // // // // // // //                             <Text style={styles.detailText}>Year: {vehicle.year}</Text>
// // // // // // // // // // // //                             <Text style={styles.detailText}>Type: {vehicle.type}</Text>
// // // // // // // // // // // //                         </View>
// // // // // // // // // // // //                         <Text style={styles.descriptionText}>{vehicle.description}</Text>
// // // // // // // // // // // //                         <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // // // // //                     </View>

// // // // // // // // // // // //                     <TouchableOpacity style={styles.continueButton} onPress={onPressContinueButton}>
// // // // // // // // // // // //                         <Text style={styles.continueButtonText}>CONTINUE</Text>
// // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // //                 </View>
// // // // // // // // // // // //             </ScrollView>
// // // // // // // // // // // //         </>
// // // // // // // // // // // //     );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // //     scrollView: {
// // // // // // // // // // // //         backgroundColor: 'white',
// // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     imageContainer: {
// // // // // // // // // // // //         position: 'relative',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     vehicleImage: {
// // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // //         height: 224,
// // // // // // // // // // // //         backgroundColor: '#D1D5DB', // Gray background while image loads
// // // // // // // // // // // //         padding: 16,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     backButton: {
// // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // //         top: 36,
// // // // // // // // // // // //         left: 20,
// // // // // // // // // // // //         padding: 8,
// // // // // // // // // // // //         backgroundColor: '#F3F4F6', // Light gray background for button
// // // // // // // // // // // //         borderRadius: 9999, // Full round
// // // // // // // // // // // //     },
// // // // // // // // // // // //     detailsContainer: {
// // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // //         paddingHorizontal: 16,
// // // // // // // // // // // //         paddingTop: 16,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     headerContainer: {
// // // // // // // // // // // //         paddingBottom: 20,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     title: {
// // // // // // // // // // // //         fontSize: 24,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     row: {
// // // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     detailText: {
// // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // //         color: '#6B7280', // Gray text color
// // // // // // // // // // // //     },
// // // // // // // // // // // //     descriptionText: {
// // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // //         color: '#374151', // Dark gray text color
// // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     priceText: {
// // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //         color: '#F59E0B', // Amber color for price
// // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     continueButton: {
// // // // // // // // // // // //         backgroundColor: '#F59E0B', // Amber color for button
// // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // //         paddingVertical: 14,
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     continueButtonText: {
// // // // // // // // // // // //         color: 'white',
// // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //     },
// // // // // // // // // // // // });





// // // // // // // // // // // // import React from 'react';
// // // // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
// // // // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // // // // // // import { AntDesign } from '@expo/vector-icons';

// // // // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // //     const { vehicleName } = useLocalSearchParams();

// // // // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // // // //         router.push('/CalendarScreen');
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const onPressBack = () => {
// // // // // // // // // // // //         router.push('/(authenticated)/(tabs)/vehicles');
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
// // // // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // // // //             year: '2020',
// // // // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // // // //             image: 'https://tinyurl.com/yvxmpyjr',
// // // // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //         'Van': {
// // // // // // // // // // // //             year: '2019',
// // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // // // //             image: 'https://shorturl.at/vs0Bd',
// // // // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //         'Truck': {
// // // // // // // // // // // //             year: '2018',
// // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // // // //             image: 'https://shorturl.at/sIr0z',
// // // // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //         'Truck XL': {
// // // // // // // // // // // //             year: '2021',
// // // // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // // // //             image: 'https://tinyurl.com/ywzbrk7y',
// // // // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min',
// // // // // // // // // // // //         },
// // // // // // // // // // // //     };

// // // // // // // // // // // //     const vehicle = vehicleDetails[vehicleName as string];

// // // // // // // // // // // //     if (!vehicle) {
// // // // // // // // // // // //         return (
// // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // //                 <Text style={styles.headerText}>Vehicle not found</Text>
// // // // // // // // // // // //             </View>
// // // // // // // // // // // //         );
// // // // // // // // // // // //     }

// // // // // // // // // // // //     return (
// // // // // // // // // // // //         <>
// // // // // // // // // // // //             <StatusBar style="light" />
// // // // // // // // // // // //             <ScrollView style={{
// // // // // // // // // // // //                 backgroundColor: 'white',
// // // // // // // // // // // //                 flex: 1,
// // // // // // // // // // // //                 // paddingTop: 30,
// // // // // // // // // // // //             }}>
// // // // // // // // // // // //                 <View style={{
// // // // // // // // // // // //                     position: 'relative'
// // // // // // // // // // // //                 }}>
// // // // // // // // // // // //                     <Image 
// // // // // // // // // // // //                     source={{ uri: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg'}}
// // // // // // // // // // // //                     style={{
// // // // // // // // // // // //                         height: 210,
// // // // // // // // // // // //                         width: '100%',
// // // // // // // // // // // //                         padding: 16,

// // // // // // // // // // // //                     }}/>
// // // // // // // // // // // //                     <TouchableOpacity onPress={onPressBack}
// // // // // // // // // // // //                     style={{
// // // // // // // // // // // //                         position: 'absolute',
// // // // // // // // // // // //                         top: 36,
// // // // // // // // // // // //                         left: 20,
// // // // // // // // // // // //                         padding: 8,
// // // // // // // // // // // //                         backgroundColor: '#F3F4F6',
// // // // // // // // // // // //                         borderRadius: 9999,
// // // // // // // // // // // //                     }}>
// // // // // // // // // // // //                         <AntDesign name='arrowleft' size={24} color='green' />
// // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // //                 </View>

// // // // // // // // // // // //                 <View style={{
// // // // // // // // // // // //                     backgroundColor: '#fff',
// // // // // // // // // // // //                 }}>
// // // // // // // // // // // //                     <View 
// // // // // // // // // // // //                     style={{
// // // // // // // // // // // //                         paddingHorizontal: 16,
// // // // // // // // // // // //                         paddingTop: 16,
// // // // // // // // // // // //                     }}>
// // // // // // // // // // // //                         <Text
// // // // // // // // // // // //                         style={{
// // // // // // // // // // // //                             fontSize: 24,
// // // // // // // // // // // //                             fontWeight: 'bold'
// // // // // // // // // // // //                         }}>
// // // // // // // // // // // //                             Euro_Cargo
// // // // // // // // // // // //                         </Text>
// // // // // // // // // // // //                     </View>
// // // // // // // // // // // //                 </View>
// // // // // // // // // // // //             </ScrollView>
// // // // // // // // // // // //             {/* <ImageBackground
// // // // // // // // // // // //                 source={{ uri: 'https://www.pinterest.com/pin/629096641728853405'}} // Optional background image
// // // // // // // // // // // //                 style={styles.backgroundImage}
// // // // // // // // // // // //                 resizeMode="cover"
// // // // // // // // // // // //             >
// // // // // // // // // // // //                 <View style={styles.container}>
// // // // // // // // // // // //                     <ScrollView contentContainerStyle={styles.scrollViewContainer}>
// // // // // // // // // // // //                         <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
// // // // // // // // // // // //                         <Text style={styles.headerText}>{vehicleName}</Text>
// // // // // // // // // // // //                         <View style={styles.detailContainer}>
// // // // // // // // // // // //                             <Text style={styles.detailText}>Type: {vehicle.type}</Text>
// // // // // // // // // // // //                             <Text style={styles.descriptionText}>{vehicle.description}</Text>
// // // // // // // // // // // //                             <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // // // // //                         </View>
// // // // // // // // // // // //                         <Text style={styles.boldText}>Includes Two Laborers</Text>
// // // // // // // // // // // //                         <Text style={styles.regularText}>Sit back and relax while they do all the heavy lifting.</Text>
// // // // // // // // // // // //                     </ScrollView>
// // // // // // // // // // // //                     <View style={styles.floatingButtonContainer}>
// // // // // // // // // // // //                         <TouchableOpacity style={styles.floatingButton} onPress={onPressContinueButton}>
// // // // // // // // // // // //                             <Text style={styles.footerText}>CONTINUE</Text>
// // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // //                     </View>
// // // // // // // // // // // //                 </View>
// // // // // // // // // // // //             </ImageBackground> */}
// // // // // // // // // // // //         </>
// // // // // // // // // // // //     );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // //     container: {
// // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // //         backgroundColor: 'light gray', // Slight transparency for overlay
// // // // // // // // // // // //     },
// // // // // // // // // // // //     backgroundImage: {
// // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     scrollViewContainer: {
// // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // //         paddingBottom: 100, // Extra padding for floating button space
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     vehicleImage: {
// // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // //         height: 250,
// // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     headerText: {
// // // // // // // // // // // //         fontSize: 28,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //         color: '#E0E0E0',
// // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     detailContainer: {
// // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // //         backgroundColor: '#1E1E1E',
// // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     detailText: {
// // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //         color: '#D3D3D3',
// // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     descriptionText: {
// // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // //         color: '#AAAAAA',
// // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     priceText: {
// // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //         color: '#F39C12',
// // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     boldText: {
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // //         color: '#D3D3D3',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     regularText: {
// // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // //         color: '#AAAAAA',
// // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // //     },
// // // // // // // // // // // //     floatingButtonContainer: {
// // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // //         bottom: 20, // Adjust based on screen
// // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     floatingButton: {
// // // // // // // // // // // //         backgroundColor: '#F39C12', // Orange color for the button
// // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // //         paddingVertical: 14,
// // // // // // // // // // // //         paddingHorizontal: 60, // Adjust width based on button size
// // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // //     },
// // // // // // // // // // // //     footerText: {
// // // // // // // // // // // //         color: '#E0E0E0',
// // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // //     },
// // // // // // // // // // // // });



// // // // // // // // // // // // // import React from 'react';
// // // // // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
// // // // // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';

// // // // // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // // //     const { vehicleName } = useLocalSearchParams();

// // // // // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // // // // //         router.push('/CalendarScreen');
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
// // // // // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // // // // //             year: '2020',
// // // // // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // // // // //             image: 'https://tinyurl.com/yvxmpyjr',
// // // // // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min',
// // // // // // // // // // // // //         },
// // // // // // // // // // // // //         'Van': {
// // // // // // // // // // // // //             year: '2019',
// // // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // // // // //             image: 'https://shorturl.at/vs0Bd',
// // // // // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min',
// // // // // // // // // // // // //         },
// // // // // // // // // // // // //         'Truck': {
// // // // // // // // // // // // //             year: '2018',
// // // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // // // // //             image: 'https://shorturl.at/sIr0z',
// // // // // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min',
// // // // // // // // // // // // //         },
// // // // // // // // // // // // //         'Truck XL': {
// // // // // // // // // // // // //             year: '2021',
// // // // // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // // // // //             image: 'https://tinyurl.com/ywzbrk7y',
// // // // // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min',
// // // // // // // // // // // // //         },
// // // // // // // // // // // // //     };

// // // // // // // // // // // // //     const vehicle = vehicleDetails[vehicleName as string];

// // // // // // // // // // // // //     if (!vehicle) {
// // // // // // // // // // // // //         return (
// // // // // // // // // // // // //             <View style={styles.container}>
// // // // // // // // // // // // //                 <Text style={styles.headerText}>Vehicle not found</Text>
// // // // // // // // // // // // //             </View>
// // // // // // // // // // // // //         );
// // // // // // // // // // // // //     }

// // // // // // // // // // // // //     return (
// // // // // // // // // // // // //         <>
// // // // // // // // // // // // //             <StatusBar style="light" />
// // // // // // // // // // // // //             <ImageBackground 
// // // // // // // // // // // // //                 source={{ uri: 'https://example.com/background.jpg' }} // Optional background image
// // // // // // // // // // // // //                 style={styles.backgroundImage}
// // // // // // // // // // // // //                 resizeMode="cover"
// // // // // // // // // // // // //             >
// // // // // // // // // // // // //                 <View style={styles.container}>
// // // // // // // // // // // // //                     <ScrollView contentContainerStyle={styles.scrollViewContainer}>
// // // // // // // // // // // // //                         <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
// // // // // // // // // // // // //                         <Text style={styles.headerText}>{vehicleName}</Text>
// // // // // // // // // // // // //                         <View style={styles.detailContainer}>
// // // // // // // // // // // // //                             <Text style={styles.detailText}>Type: {vehicle.type}</Text>
// // // // // // // // // // // // //                             <Text style={styles.descriptionText}>{vehicle.description}</Text>
// // // // // // // // // // // // //                             <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // // // // // //                         </View>
// // // // // // // // // // // // //                         <Text style={styles.boldText}>Includes Two Laborers</Text>
// // // // // // // // // // // // //                         <Text style={styles.regularText}>Sit back and relax while they do all the heavy lifting.</Text>
// // // // // // // // // // // // //                     </ScrollView>
// // // // // // // // // // // // //                     {/* Floating Continue Button */}
// // // // // // // // // // // // //                     <View style={styles.floatingButtonContainer}>
// // // // // // // // // // // // //                         <TouchableOpacity style={styles.floatingButton} onPress={onPressContinueButton}>
// // // // // // // // // // // // //                             <Text style={styles.footerText}>CONTINUE</Text>
// // // // // // // // // // // // //                         </TouchableOpacity>
// // // // // // // // // // // // //                     </View>
// // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // //             </ImageBackground>
// // // // // // // // // // // // //         </>
// // // // // // // // // // // // //     );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // //     container: {
// // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // //         backgroundColor: 'rgba(0,0,0,0.8)', // Slight transparency for overlay
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     backgroundImage: {
// // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     scrollViewContainer: {
// // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // //         paddingBottom: 80, // Extra padding for floating button space
// // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     vehicleImage: {
// // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // //         height: 250,
// // // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // //         fontSize: 28,
// // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // //         color: '#E0E0E0',
// // // // // // // // // // // // //         marginBottom: 15,
// // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     detailContainer: {
// // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // //         backgroundColor: '#1E1E1E',
// // // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // // //         padding: 20,
// // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     detailText: {
// // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // //         color: '#D3D3D3',
// // // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     descriptionText: {
// // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // //         color: '#AAAAAA',
// // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     priceText: {
// // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // //         color: '#F39C12',
// // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     boldText: {
// // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // // //         color: '#D3D3D3',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     regularText: {
// // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // //         color: '#AAAAAA',
// // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     floatingButtonContainer: {
// // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // //         bottom: 30, // Adjust based on screen
// // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     floatingButton: {
// // // // // // // // // // // // //         backgroundColor: '#F39C12', // No background or adjust as needed
// // // // // // // // // // // // //         borderRadius: 50,
// // // // // // // // // // // // //         paddingVertical: 14,
// // // // // // // // // // // // //         paddingHorizontal: 60,
// // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // //     footerText: {
// // // // // // // // // // // // //         color: '#E0E0E0',
// // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // //     },
// // // // // // // // // // // // // });



// // // // // // // // // // // // // // import React, { useLayoutEffect } from 'react';
// // // // // // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
// // // // // // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // // // // // // import { AntDesign, Ionicons } from '@expo/vector-icons';
// // // // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';

// // // // // // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // // // //     const { vehicleName } = useLocalSearchParams();
// // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();

// // // // // // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // // // // // //         router.push('/CalendarScreen')
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // //     const onPressBackButton = () => {
// // // // // // // // // // // // // //         router.push('/vehicles')
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
// // // // // // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // // // // // //             year: '2020',
// // // // // // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // // // // // //             image: 'https://tinyurl.com/yvxmpyjr',
// // // // // // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min'
// // // // // // // // // // // // // //         },
// // // // // // // // // // // // // //         'Van': {
// // // // // // // // // // // // // //             year: '2019',
// // // // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // // // // // //             image: 'https://shorturl.at/vs0Bd',
// // // // // // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min'
// // // // // // // // // // // // // //         },
// // // // // // // // // // // // // //         'Truck': {
// // // // // // // // // // // // // //             year: '2018',
// // // // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // // // // // //             image: 'https://shorturl.at/sIr0z',
// // // // // // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min'
// // // // // // // // // // // // // //         },
// // // // // // // // // // // // // //         'Truck XL': {
// // // // // // // // // // // // // //             year: '2021',
// // // // // // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // // // // // //             image: 'https://tinyurl.com/ywzbrk7y',
// // // // // // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min'
// // // // // // // // // // // // // //         },
// // // // // // // // // // // // // //     };

// // // // // // // // // // // // // //     const vehicle = vehicleDetails[vehicleName as string];

// // // // // // // // // // // // // //     if (!vehicle) {
// // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // //             <View style={[styles.container, { paddingTop: headerHeight }]}>
// // // // // // // // // // // // // //                 <Text style={styles.headerText}>Vehicle not found</Text>
// // // // // // // // // // // // // //                 <View style={styles.footer}>
// // // // // // // // // // // // // //                     <TouchableOpacity style={styles.fullButton} onPress={onPressBackButton}>
// // // // // // // // // // // // // //                         <Text style={styles.footerText}>Go Back</Text>
// // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         );
// // // // // // // // // // // // // //     }

// // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // //             <StatusBar style='light' />
// // // // // // // // // // // // // //             <View style={[styles.container, { paddingTop: 0 }]}>
// // // // // // // // // // // // // //                 <ScrollView contentContainerStyle={styles.scrollViewContainer}>
// // // // // // // // // // // // // //                     <Text style={styles.headerText}>{vehicleName}</Text>
// // // // // // // // // // // // // //                     <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
// // // // // // // // // // // // // //                     <View style={{ padding: 5, backgroundColor: 'green'}}/>
// // // // // // // // // // // // // //                     <Text style={styles.detailText}>Type: {vehicle.type}</Text>
// // // // // // // // // // // // // //                     <Text style={styles.descriptionText}>{vehicle.description}</Text>
// // // // // // // // // // // // // //                     <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // // // // // // //                     <Text style={styles.boldText}>Comes with two strong Laborers</Text>
// // // // // // // // // // // // // //                     <Text style={styles.regularText}>Sit back & relax while they do all the heavy work for you.</Text>
// // // // // // // // // // // // // //                 </ScrollView>

// // // // // // // // // // // // // //                 <View style={styles.footer}>
// // // // // // // // // // // // // //                     <TouchableOpacity style={styles.fullButton} onPress={onPressContinueButton}>
// // // // // // // // // // // // // //                         <Text style={styles.footerText}>CONTINUE</Text>
// // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // };

// // // // // // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // //         backgroundColor: Colors.background,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     scrollViewContainer: {
// // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // //         paddingTop: 10,
// // // // // // // // // // // // // //         paddingBottom: 40,
// // // // // // // // // // // // // //         // alignItems: 'center',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     vehicleImage: {
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //         height: 200,
// // // // // // // // // // // // // //         borderRadius: 15,
// // // // // // // // // // // // // //         marginBottom: 30,
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // // // // // //         shadowOpacity: 0.25,
// // // // // // // // // // // // // //         shadowRadius: 3.84,
// // // // // // // // // // // // // //         elevation: 5,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // //         fontSize: 30,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: 'blue',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     detailText: {
// // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#555',
// // // // // // // // // // // // // //         marginTop: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     descriptionText: {
// // // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         color: '#777',
// // // // // // // // // // // // // //         paddingHorizontal: 10,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     priceText: {
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         color: Colors.primary,
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     boldText: {
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // // // //         color: '#444',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     regularText: {
// // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // //         color: '#666',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     footer: {
// // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // //         bottom: 0,
// // // // // // // // // // // // // //         left: 0,
// // // // // // // // // // // // // //         right: 0,
// // // // // // // // // // // // // //         height: 80,
// // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // //         elevation: 10,
// // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // //         shadowOffset: { width: 0, height: -10 },
// // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // //         shadowRadius: 10,
// // // // // // // // // // // // // //         borderTopLeftRadius: 15,
// // // // // // // // // // // // // //         borderTopRightRadius: 15,
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     fullButton: {
// // // // // // // // // // // // // //         backgroundColor: Colors.primary,
// // // // // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // // // // //         padding: 14,
// // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // //     },
// // // // // // // // // // // // // //     footerText: {
// // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // });


// // // // // // // // // // // // // // // import React, { useLayoutEffect } from 'react';
// // // // // // // // // // // // // // // import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
// // // // // // // // // // // // // // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // // // // // // // // // // // // // import { AntDesign, Ionicons } from '@expo/vector-icons';
// // // // // // // // // // // // // // // import Colors from '@/constants/Colors';
// // // // // // // // // // // // // // // import { useHeaderHeight } from '@react-navigation/elements';
// // // // // // // // // // // // // // // import { StatusBar } from 'expo-status-bar';

// // // // // // // // // // // // // // // const VehicleDetail: React.FC = () => {
// // // // // // // // // // // // // // //     const router = useRouter();
// // // // // // // // // // // // // // //     const { vehicleName } = useLocalSearchParams();
// // // // // // // // // // // // // // //     const headerHeight = useHeaderHeight();


// // // // // // // // // // // // // // //     const onPressContinueButton = () => {
// // // // // // // // // // // // // // //         router.push('CalendarScreen')
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // //     const onPressBackButton = () => {
// // // // // // // // // // // // // // //         router.push('vehicles')
// // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // //     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
// // // // // // // // // // // // // // //         'Pick up Truck': {
// // // // // // // // // // // // // // //             year: '2020',
// // // // // // // // // // // // // // //             type: 'Full Size Truck',
// // // // // // // // // // // // // // //             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
// // // // // // // // // // // // // // //             image: 'https://tinyurl.com/yvxmpyjr',
// // // // // // // // // // // // // // //             price: '25,000 Kshs + 2,000 Kshs per labor min'
// // // // // // // // // // // // // // //         },
// // // // // // // // // // // // // // //         'Van': {
// // // // // // // // // // // // // // //             year: '2019',
// // // // // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // // // // //             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
// // // // // // // // // // // // // // //             image: 'https://shorturl.at/vs0Bd',
// // // // // // // // // // // // // // //             price: '15,000 Kshs + 1,500 Kshs per labor min'
// // // // // // // // // // // // // // //         },
// // // // // // // // // // // // // // //         'Truck': {
// // // // // // // // // // // // // // //             year: '2018',
// // // // // // // // // // // // // // //             type: 'Standard',
// // // // // // // // // // // // // // //             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
// // // // // // // // // // // // // // //             image: 'https://shorturl.at/sIr0z',
// // // // // // // // // // // // // // //             price: '20,000 Kshs + 1,800 Kshs per labor min'
// // // // // // // // // // // // // // //         },
// // // // // // // // // // // // // // //         'Truck XL': {
// // // // // // // // // // // // // // //             year: '2021',
// // // // // // // // // // // // // // //             type: 'Extra Large',
// // // // // // // // // // // // // // //             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
// // // // // // // // // // // // // // //             image: 'https://tinyurl.com/ywzbrk7y',
// // // // // // // // // // // // // // //             price: '30,000 Kshs + 2,500 Kshs per labor min'
// // // // // // // // // // // // // // //         },
// // // // // // // // // // // // // // //     };

// // // // // // // // // // // // // // //     const vehicle = vehicleDetails[vehicleName as string];

// // // // // // // // // // // // // // //     if (!vehicle) {
// // // // // // // // // // // // // // //         return (
// // // // // // // // // // // // // // //             <View style={[styles.container, { paddingTop: headerHeight }]}
// // // // // // // // // // // // // // //             >
// // // // // // // // // // // // // // //                 <Text style={styles.headerText}>Vehicle not found</Text>
// // // // // // // // // // // // // // //                 <View style={styles.footer}>
// // // // // // // // // // // // // // //                     <TouchableOpacity style={styles.fullButton} onPress={onPressBackButton}>
// // // // // // // // // // // // // // //                         <Text style={styles.footerText}>Go Back</Text>
// // // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         );
// // // // // // // // // // // // // // //     }

// // // // // // // // // // // // // // //     return (
// // // // // // // // // // // // // // //         <>
// // // // // // // // // // // // // // //             <StatusBar style='dark' />
// // // // // // // // // // // // // // //             <View style={[styles.container, { paddingTop: headerHeight }]}>
// // // // // // // // // // // // // // //                 <ScrollView contentContainerStyle={styles.scrollViewContainer}>
// // // // // // // // // // // // // // //                     <Text style={styles.headerText}>{vehicleName}</Text>
// // // // // // // // // // // // // // //                     <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
// // // // // // // // // // // // // // //                     <Text style={styles.detailText}>Type: {vehicle.type}</Text>
// // // // // // // // // // // // // // //                     <Text style={styles.descriptionText}>{vehicle.description}</Text>
// // // // // // // // // // // // // // //                     <Text style={styles.priceText}>{vehicle.price}</Text>
// // // // // // // // // // // // // // //                     <Text style={styles.boldText}>Comes with two strong guys</Text>
// // // // // // // // // // // // // // //                     <Text style={styles.regularText}>Sit back & relax while they do all the heavy work for you.</Text>
// // // // // // // // // // // // // // //                 </ScrollView>

// // // // // // // // // // // // // // //                 <View style={styles.footer}>
// // // // // // // // // // // // // // //                     <TouchableOpacity style={styles.fullButton} onPress={onPressContinueButton}>
// // // // // // // // // // // // // // //                         <Text style={styles.footerText}>CONTINUE</Text>
// // // // // // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // // // // // //                 </View>
// // // // // // // // // // // // // // //             </View>
// // // // // // // // // // // // // // //         </>
// // // // // // // // // // // // // // //     );
// // // // // // // // // // // // // // // };

// // // // // // // // // // // // // // // export default VehicleDetail;

// // // // // // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // // // // // //     container: {
// // // // // // // // // // // // // // //         flex: 1,
// // // // // // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // // // // // //         backgroundColor: Colors.lightGray,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     scrollViewContainer: {
// // // // // // // // // // // // // // //         paddingHorizontal: 20,
// // // // // // // // // // // // // // //         paddingTop: 20,
// // // // // // // // // // // // // // //         paddingBottom: 40,
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     vehicleImage: {
// // // // // // // // // // // // // // //         width: '100%',
// // // // // // // // // // // // // // //         height: 200,
// // // // // // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     headerText: {
// // // // // // // // // // // // // // //         fontSize: 24,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     detailText: {
// // // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // // //         color: '#555',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     descriptionText: {
// // // // // // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // // //         color: '#777',
// // // // // // // // // // // // // // //         paddingHorizontal: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     priceText: {
// // // // // // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         color: '#555',
// // // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     boldText: {
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // // //         marginBottom: 5,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     regularText: {
// // // // // // // // // // // // // // //         textAlign: 'center',
// // // // // // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     footer: {
// // // // // // // // // // // // // // //         position: 'absolute',
// // // // // // // // // // // // // // //         bottom: 0,
// // // // // // // // // // // // // // //         left: 0,
// // // // // // // // // // // // // // //         right: 0,
// // // // // // // // // // // // // // //         height: 100,
// // // // // // // // // // // // // // //         padding: 10,
// // // // // // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // // // // // //         elevation: 10,
// // // // // // // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // // // // // // //         shadowOffset: { width: 0, height: -10 },
// // // // // // // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // // // // // // //         shadowRadius: 10,
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     fullButton: {
// // // // // // // // // // // // // // //         backgroundColor: Colors.primary,
// // // // // // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // // // // // //         padding: 14,
// // // // // // // // // // // // // // //         // width: '100%',
// // // // // // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // // // // // //     },
// // // // // // // // // // // // // // //     footerText: {
// // // // // // // // // // // // // // //         color: '#fff',
// // // // // // // // // // // // // // //         fontSize: 20,
// // // // // // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // // // // // //     }
// // // // // // // // // // // // // // // });


