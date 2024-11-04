import React, { useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Define proper TypeScript interfaces
interface Vehicle {
  id: string;
  name: string;
  type: string;
  image: string;
  description: string;
  capacity: string;
  price: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.vehicleItem, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={styles.touchable}
      >
        <Image
          source={{ uri: vehicle.image }}
          style={styles.vehicleImage}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleDetail}>{vehicle.type}</Text>
        </View>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#1fd655" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const VehiclesScreen = () => {
  const router = useRouter();

  const vehicles: Vehicle[] = [
    {
      id: 'pickup-truck',
      name: 'Pick up Truck',
      type: 'Year: 2020',
      image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg',
      description: 'Perfect for small to medium moves and deliveries',
      capacity: '2000 lbs',
      price: '$89/hour'
    },
    {
      id: 'van',
      name: 'Van',
      type: 'Type: Standard',
      image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg',
      description: 'Ideal for moving apartments and small homes',
      capacity: '3000 lbs',
      price: '$99/hour'
    },
    {
      id: 'truck',
      name: 'Truck',
      type: 'Type: Standard',
      image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg',
      description: 'Great for moving homes and large items',
      capacity: '5000 lbs',
      price: '$129/hour'
    },
    {
      id: 'truck-xl',
      name: 'Truck XL',
      type: 'Type: Extra Large',
      image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg',
      description: 'Largest option for big moves and commercial use',
      capacity: '8000 lbs',
      price: '$159/hour'
    }
  ];

  const navigateToDetail = (vehicle: Vehicle) => {
    router.push({
      pathname: `/vehicles/[id]`,
      params: { id: vehicle.id }
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <StatusBar style="light" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Select Your Vehicle</Text>
        <Text style={styles.descriptionText}>
          Choose the vehicle that fits your move best. We provide straps, blankets, and wrap to protect your items.
        </Text>
      </View>

      <View style={styles.vehicleContainer}>
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onPress={() => navigateToDetail(vehicle)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default VehiclesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerText: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#f5f5f7',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#a1a1a3',
    lineHeight: 24,
  },
  vehicleContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  vehicleItem: {
    borderRadius: 16,
    backgroundColor: '#2c2c2e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 4,
  },
  touchable: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  textContainer: {
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f5f5f7',
    marginBottom: 4,
  },
  vehicleDetail: {
    fontSize: 15,
    color: '#a1a1a3',
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
});


// import React, { useRef } from 'react';
// import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Colors from '@/constants/Colors';
// import { StatusBar } from 'expo-status-bar';
// import { MaterialCommunityIcons } from '@expo/vector-icons';

// const VehicleCard = ({ name, type, image, onPress }: any) => {
//     const scaleAnim = useRef(new Animated.Value(1)).current;

//     const onPressIn = () => {
//         Animated.spring(scaleAnim, {
//             toValue: 0.95,
//             useNativeDriver: true,
//         }).start();
//     };

//     const onPressOut = () => {
//         Animated.spring(scaleAnim, {
//             toValue: 1,
//             useNativeDriver: true,
//         }).start();
//     };

//     return (
//         <Animated.View style={[styles.vehicleItem, { transform: [{ scale: scaleAnim }] }]}>
//             <TouchableOpacity
//                 onPress={onPress}
//                 onPressIn={onPressIn}
//                 onPressOut={onPressOut}
//                 activeOpacity={1}
//                 style={styles.touchable}
//             >
//                 <Image
//                     source={{ uri: image }}
//                     style={styles.vehicleImage}
//                     resizeMode="cover"
//                 />
//                 <View style={styles.textContainer}>
//                     <Text style={styles.vehicleName}>{name}</Text>
//                     <Text style={styles.vehicleDetail}>{type}</Text>
//                 </View>
//                 <View style={styles.iconContainer}>
//                     <MaterialCommunityIcons name="chevron-right" size={24} color="#1fd655" />
//                 </View>
//             </TouchableOpacity>
//         </Animated.View>
//     );
// };

// const VehiclesScreen = () => {
//     const router = useRouter();
//     const headerHeight = useHeaderHeight();

//     const vehicles = [
//         {
//             name: 'Pick up Truck',
//             type: 'Year: 2020',
//             image: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg'
//         },
//         {
//             name: 'Van',
//             type: 'Type: Standard',
//             image: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg'
//         },
//         {
//             name: 'Truck',
//             type: 'Type: Standard',
//             image: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg'
//         },
//         {
//             name: 'Truck XL',
//             type: 'Type: Extra Large',
//             image: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg'
//         }
//     ];

//     const navigateToDetail = (vehicleName: any) => {
//         router.push(`/(authenticated)/(tabs)/vehicles/${vehicleName}`);
//     };

//     return (
//         <ScrollView 
//             style={styles.container}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.scrollContent}
//         >
//             <StatusBar style='light' />
            
//             <View style={styles.headerContainer}>
//                 <Text style={styles.headerText}>Select Your Vehicle</Text>
//                 <Text style={styles.descriptionText}>
//                     Choose the vehicle that fits your move best. We provide straps, blankets, and wrap to protect your items.
//                 </Text>
//             </View>

//             <View style={styles.vehicleContainer}>
//                 {vehicles.map((vehicle, index) => (
//                     <VehicleCard
//                         key={index}
//                         name={vehicle.name}
//                         type={vehicle.type}
//                         image={vehicle.image}
//                         onPress={() => navigateToDetail(vehicle.name)}
//                     />
//                 ))}
//             </View>
//         </ScrollView>
//     );
// };

// export default VehiclesScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#1c1c1e',
//     },
//     scrollContent: {
//         paddingHorizontal: 20,
//         paddingTop: 20,
//         paddingBottom: 40,
//     },
//     headerContainer: {
//         marginBottom: 24,
//     },
//     headerText: {
//         fontSize: 34,
//         fontWeight: 'bold',
//         marginBottom: 12,
//         color: '#f5f5f7',
//         letterSpacing: 0.5,
//     },
//     descriptionText: {
//         fontSize: 16,
//         color: '#a1a1a3',
//         lineHeight: 24,
//     },
//     vehicleContainer: {
//         flexDirection: 'column',
//         gap: 16,
//     },
//     vehicleItem: {
//         borderRadius: 16,
//         backgroundColor: '#2c2c2e',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//         elevation: 8,
//         marginBottom: 4,
//     },
//     touchable: {
//         overflow: 'hidden',
//         borderRadius: 16,
//     },
//     vehicleImage: {
//         width: '100%',
//         height: 180,
//         borderTopLeftRadius: 16,
//         borderTopRightRadius: 16,
//     },
//     textContainer: {
//         padding: 16,
//         borderBottomLeftRadius: 16,
//         borderBottomRightRadius: 16,
//     },
//     vehicleName: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: '#f5f5f7',
//         marginBottom: 4,
//     },
//     vehicleDetail: {
//         fontSize: 15,
//         color: '#a1a1a3',
//     },
//     iconContainer: {
//         position: 'absolute',
//         right: 16,
//         top: '50%',
//         transform: [{ translateY: -12 }],
//     },
// });





// // import React from 'react';
// // import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
// // import { useRouter } from 'expo-router';
// // import { useHeaderHeight } from '@react-navigation/elements';
// // import Colors from '@/constants/Colors'; // Ensure Colors is updated for dark mode
// // import { StatusBar } from 'expo-status-bar';

// // const VehiclesScreen = () => {
// //     const router = useRouter();
// //     const headerHeight = useHeaderHeight();

// //     const navigateToDetail = (vehicleName: string) => {
// //         router.push(`/vehicleDetail?vehicleName=${vehicleName}`);
// //     };

// //     return (
// //         <ScrollView style={styles.container}
// //         // contentContainerStyle={{ paddingTop: headerHeight }}
// //         >
// //             <StatusBar style='light' />
// //             <Text style={styles.headerText}>Select Your Vehicle</Text>
// //             <Text style={styles.descriptionText}>
// //                 Choose the vehicle that fits your move best. We provide straps, blankets, and wrap to protect your items.
// //             </Text>

// //             <View style={styles.vehicleContainer}>
// //                 <TouchableOpacity
// //                     style={styles.vehicleItem}
// //                     onPress={() => navigateToDetail('Pick up Truck')}
// //                     activeOpacity={0.85}
// //                 >
// //                     <Image
// //                         source={{ uri: 'https://i.pinimg.com/originals/73/f9/c1/73f9c12c15aab4c743e16977d0b29ee2.jpg' }}
// //                         style={styles.vehicleImage}
// //                         resizeMode="cover"
// //                     />
// //                     <View style={styles.textContainer}>
// //                         <Text style={styles.vehicleName}>Pick up Truck</Text>
// //                         <Text style={styles.vehicleDetail}>Year: 2020</Text>
// //                     </View>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity
// //                     style={styles.vehicleItem}
// //                     onPress={() => navigateToDetail('Van')}
// //                     activeOpacity={0.85}
// //                 >
// //                     <Image
// //                         source={{ uri: 'https://i.pinimg.com/originals/ab/9f/1e/ab9f1e52c4ba623e90f37b144836d0e8.jpg' }}
// //                         style={styles.vehicleImage}
// //                         resizeMode="cover"
// //                     />
// //                     <View style={styles.textContainer}>
// //                         <Text style={styles.vehicleName}>Van</Text>
// //                         <Text style={styles.vehicleDetail}>Type: Standard</Text>
// //                     </View>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity
// //                     style={styles.vehicleItem}
// //                     onPress={() => navigateToDetail('Truck')}
// //                     activeOpacity={0.85}
// //                 >
// //                     <Image
// //                         source={{ uri: 'https://i.pinimg.com/originals/17/60/8a/17608a50e87b85a23a6ff5833156c82a.jpg' }}
// //                         style={styles.vehicleImage}
// //                         resizeMode="cover"
// //                     />
// //                     <View style={styles.textContainer}>
// //                         <Text style={styles.vehicleName}>Truck</Text>
// //                         <Text style={styles.vehicleDetail}>Type: Standard</Text>
// //                     </View>
// //                 </TouchableOpacity>

// //                 <TouchableOpacity
// //                     style={styles.vehicleItem}
// //                     onPress={() => navigateToDetail('Truck XL')}
// //                     activeOpacity={0.85}
// //                 >
// //                     <Image
// //                         source={{ uri: 'https://i.pinimg.com/originals/a3/80/ef/a380ef275d361df294d417ad4331cb8c.jpg' }}
// //                         style={styles.vehicleImage}
// //                         resizeMode="cover"
// //                     />
// //                     <View style={styles.textContainer}>
// //                         <Text style={styles.vehicleName}>Truck XL</Text>
// //                         <Text style={styles.vehicleDetail}>Type: Extra Large</Text>
// //                     </View>
// //                 </TouchableOpacity>
// //             </View>
// //         </ScrollView>
// //     );
// // };

// // export default VehiclesScreen;

// // const styles = StyleSheet.create({
// //     container: {
// //         flexGrow: 1,
// //         paddingHorizontal: 20,
// //         paddingTop: 20,
// //         paddingBottom: 40,
// //         backgroundColor: '#1c1c1e', // Dark gray background for the theme
// //     },
// //     headerText: {
// //         fontSize: 32,
// //         fontWeight: 'bold',
// //         marginBottom: 20,
// //         textAlign: 'center',
// //         color: '#f5f5f7', // Light color for better contrast
// //     },
// //     descriptionText: {
// //         fontSize: 16,
// //         marginBottom: 20,
// //         textAlign: 'center',
// //         color: '#a1a1a3', // Softer gray for descriptions
// //         lineHeight: 22,
// //     },
// //     vehicleContainer: {
// //         flexDirection: 'column',
// //         marginBottom: 80,
// //     },
// //     vehicleItem: {
// //         width: '100%',
// //         borderWidth: 0,
// //         padding: 15,
// //         marginBottom: 20,
// //         alignItems: 'center',
// //         borderRadius: 12,
// //         overflow: 'hidden',
// //         shadowColor: '#000',
// //         shadowOffset: {
// //             width: 0,
// //             height: 4,
// //         },
// //         shadowOpacity: 0.3,
// //         shadowRadius: 6,
// //         elevation: 8,
// //         backgroundColor: '#2c2c2e', // Dark card background
// //         // transition: 'background-color 0.3s',
// //     },
// //     vehicleItemPressed: {
// //         backgroundColor: '#3a3a3c',
// //     },
// //     vehicleImage: {
// //         width: '100%',
// //         height: 150,
// //         borderRadius: 10,
// //     },
// //     textContainer: {
// //         alignItems: 'center',
// //         marginTop: 10,
// //     },
// //     vehicleName: {
// //         fontWeight: 'bold',
// //         fontSize: 18,
// //         textAlign: 'center',
// //         marginBottom: 5,
// //         color: '#f5f5f7', // Light text for dark background
// //     },
// //     vehicleDetail: {
// //         fontSize: 14,
// //         textAlign: 'center',
// //         color: '#d1d1d3', // Softer text color for details
// //     },
// // });



// // // import React from 'react';
// // // import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
// // // import { useRouter } from 'expo-router';
// // // import { useHeaderHeight } from '@react-navigation/elements';
// // // import Colors from '@/constants/Colors';
// // // import { StatusBar } from 'expo-status-bar';

// // // const VehiclesScreen = () => {
// // //     const router = useRouter();
// // //     const headerHeight = useHeaderHeight();

// // //     const navigateToDetail = (vehicleName: string) => {
// // //         router.push(`/vehicleDetail?vehicleName=${vehicleName}`);
// // //     };

// // //     return (
// // //         <ScrollView style={styles.container}
// // //         // contentContainerStyle={{ paddingTop: headerHeight }}
// // //         >
// // //             <StatusBar style='light' />
// // //             <Text style={styles.headerText}>Select your vehicle</Text>
// // //             <Text style={styles.descriptionText}>
// // //                 Choose which vehicle works best for your move. We'll have straps,
// // //                 blankets, and wrap to protect your items.
// // //             </Text>

// // //             <View style={styles.vehicleContainer}>
// // //                 <TouchableOpacity
// // //                     style={styles.vehicleItem}
// // //                     onPress={() => navigateToDetail('Pick up Truck')}
// // //                 >
// // //                     <Image
// // //                         source={{ uri: 'https://tinyurl.com/yvxmpyjr' }}
// // //                         style={styles.vehicleImage}
// // //                         resizeMode="cover"
// // //                     />
// // //                     <View style={styles.textContainer}>
// // //                         <Text style={styles.vehicleName}>Pick up Truck</Text>
// // //                         <Text style={styles.vehicleDetail}>Year: 2020</Text>
// // //                     </View>
// // //                 </TouchableOpacity>

// // //                 <TouchableOpacity
// // //                     style={styles.vehicleItem}
// // //                     onPress={() => navigateToDetail('Van')}
// // //                 >
// // //                     <Image
// // //                         source={{ uri: 'https://shorturl.at/vs0Bd' }}
// // //                         style={styles.vehicleImage}
// // //                         resizeMode="cover"
// // //                     />
// // //                     <View style={styles.textContainer}>
// // //                         <Text style={styles.vehicleName}>Van</Text>
// // //                         <Text style={styles.vehicleDetail}>Type: Standard</Text>
// // //                     </View>
// // //                 </TouchableOpacity>

// // //                 <TouchableOpacity
// // //                     style={styles.vehicleItem}
// // //                     onPress={() => navigateToDetail('Truck')}
// // //                 >
// // //                     <Image
// // //                         source={{ uri: 'https://shorturl.at/sIr0z' }}
// // //                         style={styles.vehicleImage}
// // //                         resizeMode="cover"
// // //                     />
// // //                     <View style={styles.textContainer}>
// // //                         <Text style={styles.vehicleName}>Truck</Text>
// // //                         <Text style={styles.vehicleDetail}>Type: Standard</Text>
// // //                     </View>
// // //                 </TouchableOpacity>

// // //                 <TouchableOpacity
// // //                     style={styles.vehicleItem}
// // //                     onPress={() => navigateToDetail('Truck XL')}
// // //                 >
// // //                     <Image
// // //                         source={{ uri: 'https://tinyurl.com/ywzbrk7y' }}
// // //                         style={styles.vehicleImage}
// // //                         resizeMode="cover"
// // //                     />
// // //                     <View style={styles.textContainer}>
// // //                         <Text style={styles.vehicleName}>Truck XL</Text>
// // //                         <Text style={styles.vehicleDetail}>Type: Extra Large</Text>
// // //                     </View>
// // //                 </TouchableOpacity>
// // //             </View>
// // //         </ScrollView>
// // //     );
// // // };

// // // export default VehiclesScreen;

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flexGrow: 1,
// // //         paddingHorizontal: 20,
// // //         paddingTop: 20,
// // //         paddingBottom: 40,
// // //         backgroundColor: Colors.background,
// // //     },
// // //     headerText: {
// // //         fontSize: 30,
// // //         fontWeight: 'bold',
// // //         marginBottom: 20,
// // //         textAlign: 'center',
// // //         color: '#333',
// // //     },
// // //     descriptionText: {
// // //         fontSize: 16,
// // //         marginBottom: 20,
// // //         textAlign: 'center',
// // //         color: '#555',
// // //     },
// // //     vehicleContainer: {
// // //         flexDirection: 'column',
// // //         marginBottom: 80
// // //     },
// // //     vehicleItem: {
// // //         width: '100%',
// // //         borderWidth: 1,
// // //         borderColor: '#ddd',
// // //         padding: 10,
// // //         marginBottom: 20,
// // //         alignItems: 'center',
// // //         borderRadius: 10,
// // //         overflow: 'hidden',
// // //         shadowColor: '#000',
// // //         shadowOffset: {
// // //             width: 0,
// // //             height: 2,
// // //         },
// // //         shadowOpacity: 0.25,
// // //         shadowRadius: 3.84,
// // //         elevation: 5,
// // //         backgroundColor: '#fff',
// // //         // transition: 'background-color 0.3s',
// // //     },
// // //     vehicleItemPressed: {
// // //         backgroundColor: '#f0f0f0',
// // //     },
// // //     vehicleImage: {
// // //         width: '100%',
// // //         height: 150,
// // //         borderRadius: 10,
// // //     },
// // //     textContainer: {
// // //         alignItems: 'center',
// // //         marginTop: 10,
// // //     },
// // //     vehicleName: {
// // //         fontWeight: 'bold',
// // //         fontSize: 16,
// // //         textAlign: 'center',
// // //         marginBottom: 5,
// // //         color: '#333',
// // //     },
// // //     vehicleDetail: {
// // //         fontSize: 12,
// // //         textAlign: 'center',
// // //         marginBottom: 10,
// // //         color: '#888',
// // //     },
// // // });




// // // // import React from 'react';
// // // // import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';

// // // // const Vehicles: React.FC = () => {
// // // //     return (
// // // //         <ScrollView contentContainerStyle={styles.container}>
// // // //             <Text style={styles.headerText}>Select your vehicle</Text>
// // // //             <Text style={styles.descriptionText}>
// // // //                 Choose which vehicle works best for your move. We'll have straps,
// // // //                 blankets, and wrap to protect your items.
// // // //             </Text>

// // // //             {/* Vehicle selection components */}
// // // //             <View style={styles.vehicleContainer}>
// // // //                 {/* Car */}
// // // //                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
// // // //                     <Image
// // // //                         source={{ uri: 'https://shorturl.at/AoDLC' }}
// // // //                         style={styles.vehicleImage}
// // // //                     />
// // // //                     <Text style={styles.vehicleName}>Toyota Camry</Text>
// // // //                     <Text style={styles.vehicleDetail}>Year: 2020</Text>
// // // //                 </View>

// // // //                 {/* Van */}
// // // //                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
// // // //                     <Image
// // // //                         source={{ uri: 'https://shorturl.at/AoDLC' }}
// // // //                         style={styles.vehicleImage}
// // // //                     />
// // // //                     <Text style={styles.vehicleName}>Van</Text>
// // // //                     <Text style={styles.vehicleDetail}>Type: Standard</Text>
// // // //                 </View>

// // // //                 {/* Truck */}
// // // //                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
// // // //                     <Image
// // // //                         source={{ uri: 'https://shorturl.at/AoDLC' }}
// // // //                         style={styles.vehicleImage}
// // // //                     />
// // // //                     <Text style={styles.vehicleName}>Truck</Text>
// // // //                     <Text style={styles.vehicleDetail}>Type: Standard</Text>
// // // //                 </View>

// // // //                 {/* Truck XL */}
// // // //                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
// // // //                     <Image
// // // //                         source={{ uri: 'https://shorturl.at/AoDLC' }}
// // // //                         style={styles.vehicleImage}
// // // //                     />
// // // //                     <Text style={styles.vehicleName}>Truck XL</Text>
// // // //                     <Text style={styles.vehicleDetail}>Type: Extra Large</Text>
// // // //                 </View>
// // // //             </View>
// // // //         </ScrollView>
// // // //     );
// // // // };

// // // // export default Vehicles;

// // // // const styles = StyleSheet.create({
// // // //     container: {
// // // //         flexGrow: 1,
// // // //         paddingHorizontal: 20,
// // // //         paddingTop: 20,
// // // //         paddingBottom: 40,
// // // //     },
// // // //     headerText: {
// // // //         fontSize: 30,
// // // //         fontWeight: 'bold',
// // // //         marginBottom: 20,
// // // //         textAlign: 'center',
// // // //     },
// // // //     descriptionText: {
// // // //         fontSize: 16,
// // // //         marginBottom: 20,
// // // //         textAlign: 'center',
// // // //     },
// // // //     vehicleContainer: {
// // // //         flexDirection: 'row',
// // // //         flexWrap: 'wrap',
// // // //         justifyContent: 'space-between',
// // // //     },
// // // //     vehicleItem: {
// // // //         width: '45%',
// // // //         borderWidth: 1,
// // // //         borderColor: '#ddd',
// // // //         padding: 10,
// // // //         marginBottom: 20,
// // // //         alignItems: 'center',
// // // //     },
// // // //     fullWidthItem: {
// // // //         width: '100%',
// // // //     },
// // // //     vehicleImage: {
// // // //         width: 100,
// // // //         height: 100,
// // // //         borderRadius: 5,
// // // //         marginBottom: 10,
// // // //     },
// // // //     vehicleName: {
// // // //         fontWeight: 'bold',
// // // //         fontSize: 16,
// // // //         textAlign: 'center',
// // // //         marginBottom: 5,
// // // //     },
// // // //     vehicleDetail: {
// // // //         fontSize: 12,
// // // //         textAlign: 'center',
// // // //         marginBottom: 5,
// // // //     },
// // // // });



// // // // import { StyleSheet, Text, View } from 'react-native'
// // // // import React from 'react'

// // // // const vehicles = () => {
// // // //     return (
// // // //         <View>
// // // //             <Text style={styles.headerText}>Select your vehicle</Text>
// // // //             <Text style={{
// // // //                 marginTop: 10,
// // // //                 marginBottom: 10,
// // // //                 textAlign: 'center',
// // // //                 fontSize: 10
// // // //             }}>Choose which Vehicle works best for your move. We'll have straps,
// // // //                 blankets, and wrap to protect your items.
// // // //             </Text>
// // // //             {/* Vehicle selection components */}
// // // //             <View>
// // // //                 {/* Vehicle component */}
// // // //                 <View style={{
// // // //                     borderWidth: 1,
// // // //                     borderColor: '#ddd',
// // // //                     padding: 10,
// // // //                     marginBottom: 10
// // // //                 }}>
// // // //                     {/* Vehicle image */}
// // // //                     <Image
// // // //                         source={{ uri: 'https://shorturl.at/AoDLC' }}
// // // //                         style={{
// // // //                             width: 100,
// // // //                             height: 100,
// // // //                             borderRadius: 5
// // // //                         }}
// // // //                     />
// // // //                     {/* Vehicle details */}
// // // //                     <Text style={{
// // // //                         marginTop: 10,
// // // //                         marginBottom: 10,
// // // //                         fontWeight: 'bold'
// // // //                     }}>
// // // //                         Toyota Camry
// // // //                     </Text>
// // // //                     <Text style={{
// // // //                         marginTop: 5,
// // // //                         marginBottom: 5
// // // //                     }}>
// // // //                         Year: 2020
// // // //                     </Text>
// // // //                 </View>
// // // //                 {/* Additional vehicle components */}
// // // //                 {/*... */}
// // // //             </View>
// // // //         </View>
// // // //     )
// // // // }

// // // // export default vehicles

// // // // const styles = StyleSheet.create({
// // // //     headerText: {
// // // //         fontSize: 30,
// // // //         fontWeight: 'bold',
// // // //         marginBottom: 20
// // // //     }
// // // // })