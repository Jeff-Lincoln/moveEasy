import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const ProfilePage = () => {
  const { user } = useUser();
  const [showFullBio, setShowFullBio] = useState(false);

  const userStats = [
    { 
      icon: 'truck-fast',
      label: 'Moves Completed',
      value: '3',
      iconLibrary: FontAwesome5
    },
    {
      icon: 'star',
      label: 'Rating',
      value: '4.8',
      iconLibrary: FontAwesome5
    },
    {
      icon: 'calendar-check',
      label: 'Member Since',
      value: '2023',
      iconLibrary: FontAwesome5
    },
  ];

  const handleEditProfile = () => {
    // Handle edit profile action
  };

  const handleLocationPress = () => {
    Linking.openURL('https://maps.google.com/?q=Nairobi,Kenya');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+25474197359');
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${user?.primaryEmailAddress?.emailAddress}`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: user?.imageUrl || 'https://example.com/default-avatar.png' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified User</Text>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* User Stats */}
      <View style={styles.statsContainer}>
        {userStats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <stat.iconLibrary name={stat.icon} size={24} color="#007AFF" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Next Move Card */}
      <View style={styles.moveCard}>
        <Text style={styles.cardTitle}>Upcoming Move</Text>
        <View style={styles.moveDetails}>
          <View style={styles.moveLocation}>
            <Ionicons name="location" size={24} color="#007AFF" />
            <View style={styles.locationText}>
              <Text style={styles.fromTo}>From: Nairobi CBD</Text>
              <Text style={styles.fromTo}>To: Westlands</Text>
            </View>
          </View>
          <Text style={styles.moveDate}>Scheduled: Oct 15, 2024</Text>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <TouchableOpacity style={styles.infoRow} onPress={handlePhonePress}>
          <Ionicons name="call-outline" size={24} color="#666" />
          <Text style={styles.infoText}>+254 74197359</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoRow} onPress={handleLocationPress}>
          <Ionicons name="location-outline" size={24} color="#666" />
          <Text style={styles.infoText}>Nairobi, Kenya</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoRow} onPress={handleEmailPress}>
          <MaterialCommunityIcons name="email-outline" size={24} color="#666" />
          <Text style={styles.infoText}>{user?.primaryEmailAddress?.emailAddress || 'email@example.com'}</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moving Preferences</Text>
        <View style={styles.preferencesContainer}>
          <View style={styles.preferenceItem}>
            <MaterialCommunityIcons name="box" size={24} color="#007AFF" />
            <Text style={styles.preferenceText}>Professional Packing</Text>
          </View>
          <View style={styles.preferenceItem}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#007AFF" />
            <Text style={styles.preferenceText}>Insurance Required</Text>
          </View>
          <View style={styles.preferenceItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#007AFF" />
            <Text style={styles.preferenceText}>Weekend Moves Only</Text>
          </View>
        </View>
      </View>

      {/* Additional Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <Text style={styles.aboutText}>
          This information helps our movers provide better service. Please keep it updated.
        </Text>
        <View style={styles.additionalInfoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>House Type</Text>
            <Text style={styles.infoValue}>2 Bedroom Apartment</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Preferred Time</Text>
            <Text style={styles.infoValue}>Morning (8 AM - 12 PM)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Special Notes</Text>
            <Text style={styles.infoValue}>Have fragile items, need extra care</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  verifiedText: {
    color: '#4CAF50',
    marginRight: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  moveCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  moveDetails: {
    backgroundColor: '#F5F9FF',
    padding: 15,
    borderRadius: 10,
  },
  moveLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 10,
  },
  fromTo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  moveDate: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  preferencesContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  preferenceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  additionalInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
});

export default ProfilePage;



// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
// import { useUser } from '@clerk/clerk-expo';
// import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

// const ProfilePage = () => {
//   const { user } = useUser();
//   const [showFullBio, setShowFullBio] = useState(false);

//   const userStats = [
//     { 
//       icon: 'truck-fast',
//       label: 'Moves Completed',
//       value: '3',
//       iconLibrary: FontAwesome5
//     },
//     {
//       icon: 'star',
//       label: 'Rating',
//       value: '4.8',
//       iconLibrary: FontAwesome5
//     },
//     {
//       icon: 'calendar-check',
//       label: 'Member Since',
//       value: '2023',
//       iconLibrary: FontAwesome5
//     },
//   ];

//   const handleEditProfile = () => {
//     // Handle edit profile action
//   };

//   const handleLocationPress = () => {
//     Linking.openURL('https://maps.google.com/?q=Nairobi,Kenya');
//   };

//   const handlePhonePress = () => {
//     Linking.openURL('tel:+254 74197359');
//   };

//   const handleEmailPress = () => {
//     Linking.openURL(`mailto:${user?.primaryEmailAddress?.emailAddress}`);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Profile Header */}
//       <View style={styles.header}>
//         <View style={styles.profileImageContainer}>
//           <Image
//             source={{ uri: user?.imageUrl || 'https://example.com/default-avatar.png' }}
//             style={styles.profileImage}
//           />
//           <TouchableOpacity style={styles.editImageButton}>
//             <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.userInfo}>
//           <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
//           <View style={styles.verifiedBadge}>
//             <Text style={styles.verifiedText}>Verified User</Text>
//             <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
//           </View>
//         </View>

//         <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
//           <Text style={styles.editButtonText}>Edit Profile</Text>
//         </TouchableOpacity>
//       </View>

//       {/* User Stats */}
//       <View style={styles.statsContainer}>
//         {userStats.map((stat, index) => (
//           <View key={index} style={styles.statItem}>
//             <stat.iconLibrary name={stat.icon} size={24} color="#007AFF" />
//             <Text style={styles.statValue}>{stat.value}</Text>
//             <Text style={styles.statLabel}>{stat.label}</Text>
//           </View>
//         ))}
//       </View>

//       {/* Next Move Card */}
//       <View style={styles.moveCard}>
//         <Text style={styles.cardTitle}>Upcoming Move</Text>
//         <View style={styles.moveDetails}>
//           <View style={styles.moveLocation}>
//             <Ionicons name="location" size={24} color="#007AFF" />
//             <View style={styles.locationText}>
//               <Text style={styles.fromTo}>From: Nairobi CBD</Text>
//               <Text style={styles.fromTo}>To: Westlands</Text>
//             </View>
//           </View>
//           <Text style={styles.moveDate}>Scheduled: Oct 15, 2024</Text>
//         </View>
//       </View>

//       {/* Contact Information */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Contact Information</Text>
//         <TouchableOpacity style={styles.infoRow} onPress={handlePhonePress}>
//           <Ionicons name="call-outline" size={24} color="#666" />
//           <Text style={styles.infoText}>+254 74197359</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.infoRow} onPress={handleLocationPress}>
//           <Ionicons name="location-outline" size={24} color="#666" />
//           <Text style={styles.infoText}>Nairobi, Kenya</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.infoRow} onPress={handleEmailPress}>
//           <MaterialCommunityIcons name="email-outline" size={24} color="#666" />
//           <Text style={styles.infoText}>{user?.primaryEmailAddress?.emailAddress || 'email@example.com'}</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Preferences Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Moving Preferences</Text>
//         <View style={styles.preferencesContainer}>
//           <View style={styles.preferenceItem}>
//             <MaterialCommunityIcons name="box-variant" size={24} color="#007AFF" />
//             <Text style={styles.preferenceText}>Professional Packing</Text>
//           </View>
//           <View style={styles.preferenceItem}>
//             <MaterialCommunityIcons name="shield-check" size={24} color="#007AFF" />
//             <Text style={styles.preferenceText}>Insurance Required</Text>
//           </View>
//           <View style={styles.preferenceItem}>
//             <MaterialCommunityIcons name="clock-outline" size={24} color="#007AFF" />
//             <Text style={styles.preferenceText}>Weekend Moves Only</Text>
//           </View>
//         </View>
//       </View>

//       {/* Additional Info */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Additional Information</Text>
//         <Text style={styles.aboutText}>
//           This information helps our movers provide better service. Please keep it updated.
//         </Text>
//         <View style={styles.additionalInfoContainer}>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>House Type</Text>
//             <Text style={styles.infoValue}>2 Bedroom Apartment</Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>Preferred Time</Text>
//             <Text style={styles.infoValue}>Morning (8 AM - 12 PM)</Text>
//           </View>
//           <View style={styles.infoItem}>
//             <Text style={styles.infoLabel}>Special Notes</Text>
//             <Text style={styles.infoValue}>Have fragile items, need extra care</Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     backgroundColor: '#fff',
//   },
//   profileImageContainer: {
//     position: 'relative',
//     marginBottom: 15,
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#e1e1e1',
//   },
//   editImageButton: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#007AFF',
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: '#fff',
//   },
//   userInfo: {
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 15,
//   },
//   verifiedText: {
//     color: '#4CAF50',
//     marginRight: 5,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   editButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#007AFF',
//   },
//   editButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 20,
//     backgroundColor: '#fff',
//     marginTop: 10,
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 8,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   moveCard: {
//     backgroundColor: '#fff',
//     margin: 10,
//     padding: 15,
//     borderRadius: 15,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },
//   moveDetails: {
//     backgroundColor: '#F5F9FF',
//     padding: 15,
//     borderRadius: 10,
//   },
//   moveLocation: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   locationText: {
//     marginLeft: 10,
//   },
//   fromTo: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 5,
//   },
//   moveDate: {
//     fontSize: 15,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginTop: 5,
//   },
//   section: {
//     backgroundColor: '#fff',
//     padding: 20,
//     marginTop: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 15,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     padding: 10,
//     backgroundColor: '#F8F9FA',
//     borderRadius: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 15,
//   },
//   preferencesContainer: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 10,
//     padding: 15,
//   },
//   preferenceItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   preferenceText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 15,
//   },
//   additionalInfoContainer: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 10,
//     padding: 15,
//   },
//   infoItem: {
//     marginBottom: 15,
//   },
//   infoLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: '#333',
//   },
//   aboutText: {
//     fontSize: 16,
//     color: '#666',
//     lineHeight: 24,
//     marginBottom: 15,
//   },
// });

// export default ProfilePage;


// // import React from 'react';
// // import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
// // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // import { useUser } from '@clerk/clerk-expo';

// // const Profile = () => {
// //     const { user } =  useUser();

// //     return (
// //         <ScrollView contentContainerStyle={styles.container}>
// //                 <View style={{
// //                     paddingLeft: 8,
// //                 }}>
// //                     <Text style={styles.userNameText}>
// //                         {user?.fullName}
// //                     </Text>
// //                     <Text style={{
// //                         fontSize: 18,
// //                         fontWeight: '500',
// //                         color: '#828282',
// //                         marginBottom: 10,
// //                     }}>
// //                         +254 74197359
// //                     </Text>

// //                 <View>
// //                     <TouchableOpacity>
// //                         <View style={{
// //                             flexDirection: 'row',
// //                             alignItems: 'center',
// //                             marginBottom: 10,
// //                         }}>
// //                             <Ionicons name="location-outline" size={24} color="#828282" />
// //                             <Text style={{
// //                                 marginLeft: 5,
// //                                 fontSize: 16,
// //                             }}>
// //                                 Kenya, Nairobi
// //                             </Text>
// //                         </View>
// //                     </TouchableOpacity>
// //                 </View>
// //             </View>
// //         </ScrollView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#f7f9fc',
// //         padding: 20,
// //     },
// //     userNameText: {
// //         fontSize: 24,
// //         fontWeight: 'bold',
// //         marginBottom: 5,
// //     },

// // });

// // export default Profile;
