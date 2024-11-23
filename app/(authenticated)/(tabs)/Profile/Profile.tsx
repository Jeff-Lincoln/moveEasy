import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/supabase/supabase';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  withSpring 
} from 'react-native-reanimated';

// Interfaces
interface PaymentData {
  id: string;
  user_id: string;
  user_name: string;
  origin: string;
  destination: string;
  distance: string;
  distance_price: number;
  duration: string;
  vehicle: string;
  date_time: string;
  total_price: string;
  created_at: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface UserStats {
  totalMoves: number;
  averageRating: number;
  memberSince: string;
  totalSpent: number;
  completedMoves: number;
  cancelledMoves: number;
}

const ProfilePage = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const [paymentHistory, setPaymentHistory] = useState<PaymentData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextMove, setNextMove] = useState<PaymentData | null>(null);


  
  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      // Fetch payment history
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPaymentHistory(payments || []);

      // Calculate enhanced user stats
      const completedMoves = payments?.filter(p => p.status === 'completed').length || 0;
      const cancelledMoves = payments?.filter(p => p.status === 'cancelled').length || 0;
      
      const stats: UserStats = {
        totalMoves: payments?.length || 0,
        completedMoves,
        cancelledMoves,
        averageRating: 4.8,
        memberSince: new Date(user?.createdAt).getFullYear().toString(),
        totalSpent: payments
          ?.filter(p => p.status === 'completed')
          .reduce((sum, payment) => sum + parseFloat(payment.total_price), 0) || 0
      };

      setUserStats(stats);

      // Set next upcoming move
      const upcomingMoves = payments?.filter(
        payment => new Date(payment.date_time) > new Date() && payment.status !== 'cancelled'
      ) || [];
      setNextMove(upcomingMoves[0] || null);

    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#666666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#007AFF"
          title="Pull to refresh"
        />
      }
    >
      {/* Profile Header */}
      <Animated.View 
        entering={FadeInDown.duration(800)}
        style={styles.header}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
            defaultSource={require('@/assets/images/morty.jpeg')}
          />
          <TouchableOpacity 
            style={styles.editImageButton}
            onPress={() => Alert.alert('Coming Soon', 'Profile photo update feature coming soon!')}
          >
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified User</Text>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
          </View>
          <Text style={styles.memberSince}>Member since {userStats?.memberSince}</Text>
        </View>
      </Animated.View>

      {/* User Stats */}
      <Animated.View 
        entering={FadeInRight.duration(800).delay(200)}
        style={styles.statsContainer}
      >
        <View style={styles.statItem}>
          <FontAwesome5 name="truck" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{userStats?.totalMoves || 0}</Text>
          <Text style={styles.statLabel}>Total Moves</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="star" size={24} color="#FFD700" />
          <Text style={styles.statValue}>{userStats?.averageRating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="wallet" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{formatCurrency(userStats?.totalSpent || 0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
      </Animated.View>

      {/* Next Move Card */}
      {nextMove && (
        <Animated.View 
          entering={FadeInRight.duration(800).delay(400)}
          style={styles.moveCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upcoming Move</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(nextMove.status) }]}>
              <Text style={styles.statusText}>{nextMove.status}</Text>
            </View>
          </View>
          <View style={styles.moveDetails}>
            <View style={styles.moveLocation}>
              <Ionicons name="location" size={24} color="#007AFF" />
              <View style={styles.locationText}>
                <Text style={styles.fromTo}>From: {nextMove.origin}</Text>
                <MaterialIcons name="arrow-downward" size={20} color="#666" />
                <Text style={styles.fromTo}>To: {nextMove.destination}</Text>
              </View>
            </View>
            <View style={styles.moveInfo}>
              <Text style={styles.moveInfoText}>
                <MaterialCommunityIcons name="truck-outline" size={16} color="#666" /> {nextMove.vehicle}
              </Text>
              <Text style={styles.moveInfoText}>
                <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" /> {nextMove.distance} km
              </Text>
              <Text style={styles.movePrice}>{formatCurrency(parseFloat(nextMove.total_price))}</Text>
            </View>
            <Text style={styles.moveDate}>
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#007AFF" />
              {' '}Scheduled: {formatDate(nextMove.date_time)}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Move History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Move History</Text>
        {paymentHistory.length > 0 ? (
          paymentHistory.map((payment, index) => (
            <Animated.View 
              key={`payment-${payment.id}-${index}`}
              entering={FadeInRight.duration(800).delay(600 + index * 100)}
              style={styles.historyCard}
            >
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(payment.created_at)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                  <Text style={styles.statusText}>{payment.status}</Text>
                </View>
                <Text style={styles.historyPrice}>{formatCurrency(parseFloat(payment.total_price))}</Text>
              </View>
              <View style={styles.historyDetails}>
                <View style={styles.historyLocation}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <View style={styles.locationText}>
                    <Text style={styles.historyText}>{payment.origin}</Text>
                    <MaterialCommunityIcons name="arrow-down" size={16} color="#666" />
                    <Text style={styles.historyText}>{payment.destination}</Text>
                  </View>
                </View>
                <View style={styles.historyStats}>
                  <Text style={styles.historyStatItem}>
                    <MaterialCommunityIcons name="truck-outline" size={16} color="#666" /> {payment.vehicle}
                  </Text>
                  <Text style={styles.historyStatItem}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" /> {payment.distance} km
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="truck-off" size={50} color="#666" />
            <Text style={styles.noDataText}>No move history found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
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
    borderWidth: 3,
    borderColor: '#fff',
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  memberSince: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    borderRadius: 15,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  moveCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
    flex: 1,
  },
  fromTo: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  moveInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  moveInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  movePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
    textAlign: 'right',
  },
  moveDate: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  historyDetails: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  historyLocation: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
    fontWeight: '500',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  historyStatItem: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  refreshText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default ProfilePage;

// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image, 
//   ScrollView, 
//   RefreshControl,
//   ActivityIndicator,
//   Alert,
//   Platform
// } from 'react-native';
// import { useUser } from '@clerk/clerk-expo';
// import { MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { supabase } from '@/supabase/supabase';
// import { useNavigation } from '@react-navigation/native';
// import Animated, { 
//   FadeInDown, 
//   FadeInRight,
//   withSpring 
// } from 'react-native-reanimated';

// // Interfaces
// interface PaymentData {
//   id: string;
//   user_id: string;
//   user_name: string;
//   origin: string;
//   destination: string;
//   distance: string;
//   distance_price: number;
//   duration: string;
//   vehicle: string;
//   date_time: string;
//   total_price: string;
//   created_at: string;
//   status: 'pending' | 'completed' | 'cancelled';
// }

// interface UserStats {
//   totalMoves: number;
//   averageRating: number;
//   memberSince: string;
//   totalSpent: number;
//   completedMoves: number;
//   cancelledMoves: number;
// }

// const ProfilePage = () => {
//   const { user } = useUser();
//   const navigation = useNavigation();
//   const [paymentHistory, setPaymentHistory] = useState<PaymentData[]>([]);
//   const [userStats, setUserStats] = useState<UserStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [nextMove, setNextMove] = useState<PaymentData | null>(null);

//   const fetchUserData = async () => {
//     if (!user?.id) return;

//     try {
//       setLoading(true);
//       // Fetch payment history
//       const { data: payments, error } = await supabase
//         .from('payments')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('created_at', { ascending: false });

//       if (error) throw error;

//       setPaymentHistory(payments);

//       // Calculate enhanced user stats
//       const completedMoves = payments.filter(p => p.status === 'completed').length;
//       const cancelledMoves = payments.filter(p => p.status === 'cancelled').length;
      
//       const stats: UserStats = {
//         totalMoves: payments.length,
//         completedMoves,
//         cancelledMoves,
//         averageRating: 4.8,
//         memberSince: new Date(user?.createdAt).getFullYear().toString(),
//         totalSpent: payments
//           .filter(p => p.status === 'completed')
//           .reduce((sum, payment) => sum + parseFloat(payment.total_price), 0)
//       };

//       setUserStats(stats);

//       // Set next upcoming move
//       const upcomingMoves = payments.filter(
//         payment => new Date(payment.date_time) > new Date() && payment.status !== 'cancelled'
//       );
//       setNextMove(upcomingMoves[0] || null);

//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       Alert.alert('Error', 'Failed to load profile data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserData();
//   }, [user?.id]);

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     await fetchUserData();
//     setRefreshing(false);
//   }, []);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-KE', {
//       style: 'currency',
//       currency: 'KES'
//     }).format(amount);
//   };

//   const formatDate = (dateStr: string) => {
//     return new Date(dateStr).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed': return '#4CAF50';
//       case 'pending': return '#FF9800';
//       case 'cancelled': return '#F44336';
//       default: return '#666666';
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading your profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView 
//       style={styles.container}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           tintColor="#007AFF"
//           title="Pull to refresh"
//         />
//       }
//     >
//       {/* Profile Header */}
//       <Animated.View 
//         entering={FadeInDown.duration(800)}
//         style={styles.header}
//       >
//         <View style={styles.profileImageContainer}>
//           <Image
//             source={{ uri: user?.imageUrl }}
//             style={styles.profileImage}
//           />
//           <TouchableOpacity 
//             style={styles.editImageButton}
//             onPress={() => Alert.alert('Coming Soon', 'Profile photo update feature coming soon!')}
//           >
//             <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
        
//         <View style={styles.userInfo}>
//           <Text style={styles.userName}>{user?.fullName}</Text>
//           <View style={styles.verifiedBadge}>
//             <Text style={styles.verifiedText}>Verified User</Text>
//             <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
//           </View>
//           <Text style={styles.memberSince}>Member since {userStats?.memberSince}</Text>
//         </View>
//       </Animated.View>

//       {/* User Stats */}
//       <Animated.View 
//         entering={FadeInRight.duration(800).delay(200)}
//         style={styles.statsContainer}
//       >
//         <View style={styles.statItem}>
//           <FontAwesome5 name="truck" size={24} color="#007AFF" />
//           <Text style={styles.statValue}>{userStats?.totalMoves || 0}</Text>
//           <Text style={styles.statLabel}>Total Moves</Text>
//         </View>
//         <View style={styles.statItem}>
//           <FontAwesome5 name="star" size={24} color="#FFD700" />
//           <Text style={styles.statValue}>{userStats?.averageRating}</Text>
//           <Text style={styles.statLabel}>Rating</Text>
//         </View>
//         <View style={styles.statItem}>
//           <MaterialCommunityIcons name="wallet" size={24} color="#4CAF50" />
//           <Text style={styles.statValue}>{formatCurrency(userStats?.totalSpent || 0)}</Text>
//           <Text style={styles.statLabel}>Total Spent</Text>
//         </View>
//       </Animated.View>

//       {/* Next Move Card */}
//       {nextMove && (
//         <Animated.View 
//           entering={FadeInRight.duration(800).delay(400)}
//           style={styles.moveCard}
//         >
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>Upcoming Move</Text>
//             <View style={[styles.statusBadge, { backgroundColor: getStatusColor(nextMove.status) }]}>
//               <Text style={styles.statusText}>{nextMove.status}</Text>
//             </View>
//           </View>
//           <View style={styles.moveDetails}>
//             <View style={styles.moveLocation}>
//               <Ionicons name="location" size={24} color="#007AFF" />
//               <View style={styles.locationText}>
//                 <Text style={styles.fromTo}>From: {nextMove.origin}</Text>
//                 <MaterialIcons name="arrow-downward" size={20} color="#666" />
//                 <Text style={styles.fromTo}>To: {nextMove.destination}</Text>
//               </View>
//             </View>
//             <View style={styles.moveInfo}>
//               <Text style={styles.moveInfoText}>
//                 <MaterialCommunityIcons name="truck-outline" size={16} color="#666" /> {nextMove.vehicle}
//               </Text>
//               <Text style={styles.moveInfoText}>
//                 <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" /> {nextMove.distance} km
//               </Text>
//               <Text style={styles.movePrice}>{formatCurrency(parseFloat(nextMove.total_price))}</Text>
//             </View>
//             <Text style={styles.moveDate}>
//               <MaterialCommunityIcons name="calendar-clock" size={16} color="#007AFF" />
//               {' '}Scheduled: {formatDate(nextMove.date_time)}
//             </Text>
//           </View>
//         </Animated.View>
//       )}

//       {/* Move History */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Move History</Text>
//         {paymentHistory.map((payment, index) => (
//           <Animated.View 
//             key={payment.id}
//             entering={FadeInRight.duration(800).delay(600 + index * 100)}
//             style={styles.historyCard}
//           >
//             <View style={styles.historyHeader}>
//               <Text style={styles.historyDate}>{formatDate(payment.created_at)}</Text>
//               <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
//                 <Text style={styles.statusText}>{payment.status}</Text>
//               </View>
//               <Text style={styles.historyPrice}>{formatCurrency(parseFloat(payment.total_price))}</Text>
//             </View>
//             <View style={styles.historyDetails}>
//               <View style={styles.historyLocation}>
//                 <Ionicons name="location-outline" size={20} color="#666" />
//                 <View style={styles.locationText}>
//                   <Text style={styles.historyText}>{payment.origin}</Text>
//                   <MaterialCommunityIcons name="arrow-down" size={16} color="#666" />
//                   <Text style={styles.historyText}>{payment.destination}</Text>
//                 </View>
//               </View>
//               <View style={styles.historyStats}>
//                 <Text style={styles.historyStatItem}>
//                   <MaterialCommunityIcons name="truck-outline" size={16} color="#666" /> {payment.vehicle}
//                 </Text>
//                 <Text style={styles.historyStatItem}>
//                   <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" /> {payment.distance} km
//                 </Text>
//               </View>
//             </View>
//           </Animated.View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 16,
//   },
//   header: {
//     padding: 20,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     backgroundColor: '#fff',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3.84,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
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
//     borderWidth: 3,
//     borderColor: '#fff',
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
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   userInfo: {
//     alignItems: 'center',
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   memberSince: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 5,
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
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     padding: 20,
//     backgroundColor: '#fff',
//     marginTop: 10,
//     borderRadius: 15,
//     marginHorizontal: 10,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3.84,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   statItem: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   statValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginTop: 8,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#666',
//     marginTop: 4,
//   },
//   moveCard: {
//     backgroundColor: '#fff',
//     margin: 10,
//     padding: 15,
//     borderRadius: 15,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3.84,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   statusBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginLeft: 10,
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'capitalize',
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
//     flex: 1,
//   },
//   fromTo: {
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   moveInfo: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   moveInfoText: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 5,
//     fontWeight: '500',
//   },
//   movePrice: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#007AFF',
//     marginTop: 5,
//     textAlign: 'right',
//   },
//   moveDate: {
//     fontSize: 15,
//     color: '#007AFF',
//     fontWeight: '600',
//     marginTop: 10,
//     textAlign: 'right',
//   },
//   section: {
//     backgroundColor: '#fff',
//     padding: 20,
//     marginTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 15,
//     letterSpacing: 0.5,
//   },
//   historyCard: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#eee',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   historyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   historyDate: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   historyPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#007AFF',
//   },
//   historyDetails: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 12,
//   },
//   historyLocation: {
//     flexDirection: 'row',
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   historyText: {
//     fontSize: 14,
//     color: '#333',
//     marginVertical: 2,
//     fontWeight: '500',
//   },
//   historyStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   historyStatItem: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   noDataContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   noDataText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 10,
//   },
//   refreshText: {
//     fontSize: 12,
//     color: '#999',
//     marginTop: 5,
//   },
// });

// export default ProfilePage;



// // import React, { useState, useEffect } from 'react';
// // import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator } from 'react-native';
// // import { useUser } from '@clerk/clerk-expo';
// // import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
// // import { supabase } from '@/supabase/supabase'; // Ensure this path matches your setup

// // interface PaymentData {
// //   id: string;
// //   user_id: string;
// //   user_name: string;
// //   origin: string;
// //   destination: string;
// //   distance: string;
// //   distance_price: number;
// //   duration: string;
// //   vehicle: string;
// //   date_time: string;
// //   total_price: string;
// //   created_at: string;
// // }

// // interface UserStats {
// //   totalMoves: number;
// //   averageRating: number;
// //   memberSince: string;
// //   totalSpent: number;
// // }

// // const ProfilePage = () => {
// //   const { user } = useUser();
// //   const [paymentHistory, setPaymentHistory] = useState<PaymentData[]>([]);
// //   const [userStats, setUserStats] = useState<UserStats | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [nextMove, setNextMove] = useState<PaymentData | null>(null);

// //   useEffect(() => {
// //     fetchUserData();
// //   }, [user?.id]);

// //   const fetchUserData = async () => {
// //     if (!user?.id) return;

// //     try {
// //       // Fetch payment history
// //       const { data: payments, error } = await supabase
// //         .from('payments')
// //         .select('*')
// //         .eq('user_id', user.id)
// //         .order('created_at', { ascending: false });

// //       if (error) throw error;

// //       setPaymentHistory(payments);

// //       // Calculate user stats
// //       const stats: UserStats = {
// //         totalMoves: payments.length,
// //         averageRating: 4.8, // You might want to fetch this from a separate ratings table
// //         memberSince: new Date(user.createdAt).getFullYear().toString(),
// //         totalSpent: payments.reduce((sum, payment) => sum + parseFloat(payment.total_price), 0)
// //       };

// //       setUserStats(stats);

// //       // Set next upcoming move
// //       const upcomingMoves = payments.filter(
// //         payment => new Date(payment.date_time) > new Date()
// //       );
// //       if (upcomingMoves.length > 0) {
// //         setNextMove(upcomingMoves[0]);
// //       }

// //     } catch (error) {
// //       console.error('Error fetching user data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const formatCurrency = (amount: number) => {
// //     return new Intl.NumberFormat('en-KE', {
// //       style: 'currency',
// //       currency: 'KES'
// //     }).format(amount);
// //   };

// //   const formatDate = (dateStr: string) => {
// //     return new Date(dateStr).toLocaleDateString('en-US', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric'
// //     });
// //   };

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#007AFF" />
// //       </View>
// //     );
// //   }

// //   return (
// //     <ScrollView style={styles.container}>
// //       {/* Profile Header */}
// //       <View style={styles.header}>
// //         <View style={styles.profileImageContainer}>
// //           <Image
// //             source={{ uri: user?.imageUrl }}
// //             style={styles.profileImage}
// //           />
// //           <TouchableOpacity style={styles.editImageButton}>
// //             <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
// //           </TouchableOpacity>
// //         </View>
        
// //         <View style={styles.userInfo}>
// //           <Text style={styles.userName}>{user?.fullName}</Text>
// //           <View style={styles.verifiedBadge}>
// //             <Text style={styles.verifiedText}>Verified User</Text>
// //             <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
// //           </View>
// //         </View>
// //       </View>

// //       {/* User Stats */}
// //       <View style={styles.statsContainer}>
// //         <View style={styles.statItem}>
// //           <FontAwesome5 name="truck" size={24} color="#007AFF" />
// //           <Text style={styles.statValue}>{userStats?.totalMoves || 0}</Text>
// //           <Text style={styles.statLabel}>Moves</Text>
// //         </View>
// //         <View style={styles.statItem}>
// //           <FontAwesome5 name="star" size={24} color="#007AFF" />
// //           <Text style={styles.statValue}>{userStats?.averageRating}</Text>
// //           <Text style={styles.statLabel}>Rating</Text>
// //         </View>
// //         <View style={styles.statItem}>
// //           <MaterialCommunityIcons name="wallet" size={24} color="#007AFF" />
// //           <Text style={styles.statValue}>{formatCurrency(userStats?.totalSpent || 0)}</Text>
// //           <Text style={styles.statLabel}>Total Spent</Text>
// //         </View>
// //       </View>

// //       {/* Next Move Card */}
// //       {nextMove && (
// //         <View style={styles.moveCard}>
// //           <Text style={styles.cardTitle}>Upcoming Move</Text>
// //           <View style={styles.moveDetails}>
// //             <View style={styles.moveLocation}>
// //               <Ionicons name="location" size={24} color="#007AFF" />
// //               <View style={styles.locationText}>
// //                 <Text style={styles.fromTo}>From: {nextMove.origin}</Text>
// //                 <Text style={styles.fromTo}>To: {nextMove.destination}</Text>
// //               </View>
// //             </View>
// //             <View style={styles.moveInfo}>
// //               <Text style={styles.moveInfoText}>
// //                 <MaterialCommunityIcons name="truck-outline" size={16} color="#666" /> {nextMove.vehicle}
// //               </Text>
// //               <Text style={styles.moveInfoText}>
// //                 <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" /> {nextMove.distance} km
// //               </Text>
// //               <Text style={styles.movePrice}>{formatCurrency(parseFloat(nextMove.total_price))}</Text>
// //             </View>
// //             <Text style={styles.moveDate}>Scheduled: {formatDate(nextMove.date_time)}</Text>
// //           </View>
// //         </View>
// //       )}

// //       {/* Move History */}
// //       <View style={styles.section}>
// //         <Text style={styles.sectionTitle}>Move History</Text>
// //         {paymentHistory.map((payment, index) => (
// //           <View key={payment.id} style={styles.historyCard}>
// //             <View style={styles.historyHeader}>
// //               <Text style={styles.historyDate}>{formatDate(payment.created_at)}</Text>
// //               <Text style={styles.historyPrice}>{formatCurrency(parseFloat(payment.total_price))}</Text>
// //             </View>
// //             <View style={styles.historyDetails}>
// //               <View style={styles.historyLocation}>
// //                 <Ionicons name="location-outline" size={20} color="#666" />
// //                 <View style={styles.locationText}>
// //                   <Text style={styles.historyText}>{payment.origin}</Text>
// //                   <MaterialCommunityIcons name="arrow-down" size={16} color="#666" />
// //                   <Text style={styles.historyText}>{payment.destination}</Text>
// //                 </View>
// //               </View>
// //               <View style={styles.historyStats}>
// //                 <Text style={styles.historyStatItem}>
// //                   <MaterialCommunityIcons name="truck-outline" size={16} color="#666" /> {payment.vehicle}
// //                 </Text>
// //                 <Text style={styles.historyStatItem}>
// //                   <MaterialCommunityIcons name="map-marker-distance" size={16} color="#666" /> {payment.distance} km
// //                 </Text>
// //               </View>
// //             </View>
// //           </View>
// //         ))}
// //       </View>
// //     </ScrollView>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f8f9fa',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#f8f9fa',
// //   },
// //   header: {
// //     padding: 20,
// //     alignItems: 'center',
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#eee',
// //     backgroundColor: '#fff',
// //   },
// //   profileImageContainer: {
// //     position: 'relative',
// //     marginBottom: 15,
// //   },
// //   profileImage: {
// //     width: 120,
// //     height: 120,
// //     borderRadius: 60,
// //     backgroundColor: '#e1e1e1',
// //   },
// //   editImageButton: {
// //     position: 'absolute',
// //     bottom: 0,
// //     right: 0,
// //     backgroundColor: '#007AFF',
// //     width: 36,
// //     height: 36,
// //     borderRadius: 18,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderWidth: 3,
// //     borderColor: '#fff',
// //   },
// //   userInfo: {
// //     alignItems: 'center',
// //   },
// //   userName: {
// //     fontSize: 24,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 5,
// //   },
// //   verifiedBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#E8F5E9',
// //     paddingHorizontal: 10,
// //     paddingVertical: 5,
// //     borderRadius: 15,
// //   },
// //   verifiedText: {
// //     color: '#4CAF50',
// //     marginRight: 5,
// //     fontSize: 14,
// //     fontWeight: '600',
// //   },
// //   statsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     padding: 20,
// //     backgroundColor: '#fff',
// //     marginTop: 10,
// //   },
// //   statItem: {
// //     alignItems: 'center',
// //     flex: 1,
// //   },
// //   statValue: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginTop: 8,
// //   },
// //   statLabel: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginTop: 4,
// //   },
// //   moveCard: {
// //     backgroundColor: '#fff',
// //     margin: 10,
// //     padding: 15,
// //     borderRadius: 15,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 3.84,
// //     elevation: 5,
// //   },
// //   cardTitle: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 10,
// //   },
// //   moveDetails: {
// //     backgroundColor: '#F5F9FF',
// //     padding: 15,
// //     borderRadius: 10,
// //   },
// //   moveLocation: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //     marginBottom: 10,
// //   },
// //   locationText: {
// //     marginLeft: 10,
// //     flex: 1,
// //   },
// //   fromTo: {
// //     fontSize: 16,
// //     color: '#333',
// //     marginBottom: 5,
// //   },
// //   moveInfo: {
// //     marginTop: 10,
// //     padding: 10,
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //   },
// //   moveInfoText: {
// //     fontSize: 14,
// //     color: '#666',
// //     marginBottom: 5,
// //   },
// //   movePrice: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: '#007AFF',
// //     marginTop: 5,
// //   },
// //   moveDate: {
// //     fontSize: 15,
// //     color: '#007AFF',
// //     fontWeight: '600',
// //     marginTop: 10,
// //   },
// //   section: {
// //     backgroundColor: '#fff',
// //     padding: 20,
// //     marginTop: 10,
// //   },
// //   sectionTitle: {
// //     fontSize: 18,
// //     fontWeight: '600',
// //     color: '#333',
// //     marginBottom: 15,
// //   },
// //   historyCard: {
// //     backgroundColor: '#F8F9FA',
// //     borderRadius: 10,
// //     padding: 15,
// //     marginBottom: 15,
// //   },
// //   historyHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 10,
// //   },
// //   historyDate: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// //   historyPrice: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: '#007AFF',
// //   },
// //   historyDetails: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     padding: 10,
// //   },
// //   historyLocation: {
// //     flexDirection: 'row',
// //     marginBottom: 10,
// //   },
// //   historyText: {
// //     fontSize: 14,
// //     color: '#333',
// //     marginVertical: 2,
// //   },
// //   historyStats: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 5,
// //   },
// //   historyStatItem: {
// //     fontSize: 14,
// //     color: '#666',
// //   },
// // });

// // export default ProfilePage;



// // // import React, { useState } from 'react';
// // // import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking } from 'react-native';
// // // import { useUser } from '@clerk/clerk-expo';
// // // import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

// // // const ProfilePage = () => {
// // //   const { user } = useUser();
// // //   const [showFullBio, setShowFullBio] = useState(false);

// // //   const userStats = [
// // //     { 
// // //       icon: 'truck-fast',
// // //       label: 'Moves Completed',
// // //       value: '3',
// // //       iconLibrary: FontAwesome5
// // //     },
// // //     {
// // //       icon: 'star',
// // //       label: 'Rating',
// // //       value: '4.8',
// // //       iconLibrary: FontAwesome5
// // //     },
// // //     {
// // //       icon: 'calendar-check',
// // //       label: 'Member Since',
// // //       value: '2023',
// // //       iconLibrary: FontAwesome5
// // //     },
// // //   ];

// // //   const handleEditProfile = () => {
// // //     // Handle edit profile action
// // //   };

// // //   const handleLocationPress = () => {
// // //     Linking.openURL('https://maps.google.com/?q=Nairobi,Kenya');
// // //   };

// // //   const handlePhonePress = () => {
// // //     Linking.openURL('tel:+254 74197359');
// // //   };

// // //   const handleEmailPress = () => {
// // //     Linking.openURL(`mailto:${user?.primaryEmailAddress?.emailAddress}`);
// // //   };

// // //   return (
// // //     <ScrollView style={styles.container}>
// // //       {/* Profile Header */}
// // //       <View style={styles.header}>
// // //         <View style={styles.profileImageContainer}>
// // //           <Image
// // //             source={{ uri: user?.imageUrl || 'https://example.com/default-avatar.png' }}
// // //             style={styles.profileImage}
// // //           />
// // //           <TouchableOpacity style={styles.editImageButton}>
// // //             <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
// // //           </TouchableOpacity>
// // //         </View>
        
// // //         <View style={styles.userInfo}>
// // //           <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
// // //           <View style={styles.verifiedBadge}>
// // //             <Text style={styles.verifiedText}>Verified User</Text>
// // //             <MaterialCommunityIcons name="check-decagram" size={16} color="#4CAF50" />
// // //           </View>
// // //         </View>

// // //         <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
// // //           <Text style={styles.editButtonText}>Edit Profile</Text>
// // //         </TouchableOpacity>
// // //       </View>

// // //       {/* User Stats */}
// // //       <View style={styles.statsContainer}>
// // //         {userStats.map((stat, index) => (
// // //           <View key={index} style={styles.statItem}>
// // //             <stat.iconLibrary name={stat.icon} size={24} color="#007AFF" />
// // //             <Text style={styles.statValue}>{stat.value}</Text>
// // //             <Text style={styles.statLabel}>{stat.label}</Text>
// // //           </View>
// // //         ))}
// // //       </View>

// // //       {/* Next Move Card */}
// // //       <View style={styles.moveCard}>
// // //         <Text style={styles.cardTitle}>Upcoming Move</Text>
// // //         <View style={styles.moveDetails}>
// // //           <View style={styles.moveLocation}>
// // //             <Ionicons name="location" size={24} color="#007AFF" />
// // //             <View style={styles.locationText}>
// // //               <Text style={styles.fromTo}>From: Nairobi CBD</Text>
// // //               <Text style={styles.fromTo}>To: Westlands</Text>
// // //             </View>
// // //           </View>
// // //           <Text style={styles.moveDate}>Scheduled: Oct 15, 2024</Text>
// // //         </View>
// // //       </View>

// // //       {/* Contact Information */}
// // //       <View style={styles.section}>
// // //         <Text style={styles.sectionTitle}>Contact Information</Text>
// // //         <TouchableOpacity style={styles.infoRow} onPress={handlePhonePress}>
// // //           <Ionicons name="call-outline" size={24} color="#666" />
// // //           <Text style={styles.infoText}>+254 74197359</Text>
// // //         </TouchableOpacity>
// // //         <TouchableOpacity style={styles.infoRow} onPress={handleLocationPress}>
// // //           <Ionicons name="location-outline" size={24} color="#666" />
// // //           <Text style={styles.infoText}>Nairobi, Kenya</Text>
// // //         </TouchableOpacity>
// // //         <TouchableOpacity style={styles.infoRow} onPress={handleEmailPress}>
// // //           <MaterialCommunityIcons name="email-outline" size={24} color="#666" />
// // //           <Text style={styles.infoText}>{user?.primaryEmailAddress?.emailAddress || 'email@example.com'}</Text>
// // //         </TouchableOpacity>
// // //       </View>

// // //       {/* Preferences Section */}
// // //       <View style={styles.section}>
// // //         <Text style={styles.sectionTitle}>Moving Preferences</Text>
// // //         <View style={styles.preferencesContainer}>
// // //           <View style={styles.preferenceItem}>
// // //             <MaterialCommunityIcons name="box-variant" size={24} color="#007AFF" />
// // //             <Text style={styles.preferenceText}>Professional Packing</Text>
// // //           </View>
// // //           <View style={styles.preferenceItem}>
// // //             <MaterialCommunityIcons name="shield-check" size={24} color="#007AFF" />
// // //             <Text style={styles.preferenceText}>Insurance Required</Text>
// // //           </View>
// // //           <View style={styles.preferenceItem}>
// // //             <MaterialCommunityIcons name="clock-outline" size={24} color="#007AFF" />
// // //             <Text style={styles.preferenceText}>Weekend Moves Only</Text>
// // //           </View>
// // //         </View>
// // //       </View>

// // //       {/* Additional Info */}
// // //       <View style={styles.section}>
// // //         <Text style={styles.sectionTitle}>Additional Information</Text>
// // //         <Text style={styles.aboutText}>
// // //           This information helps our movers provide better service. Please keep it updated.
// // //         </Text>
// // //         <View style={styles.additionalInfoContainer}>
// // //           <View style={styles.infoItem}>
// // //             <Text style={styles.infoLabel}>House Type</Text>
// // //             <Text style={styles.infoValue}>2 Bedroom Apartment</Text>
// // //           </View>
// // //           <View style={styles.infoItem}>
// // //             <Text style={styles.infoLabel}>Preferred Time</Text>
// // //             <Text style={styles.infoValue}>Morning (8 AM - 12 PM)</Text>
// // //           </View>
// // //           <View style={styles.infoItem}>
// // //             <Text style={styles.infoLabel}>Special Notes</Text>
// // //             <Text style={styles.infoValue}>Have fragile items, need extra care</Text>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </ScrollView>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#f8f9fa',
// // //   },
// // //   header: {
// // //     padding: 20,
// // //     alignItems: 'center',
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#eee',
// // //     backgroundColor: '#fff',
// // //   },
// // //   profileImageContainer: {
// // //     position: 'relative',
// // //     marginBottom: 15,
// // //   },
// // //   profileImage: {
// // //     width: 120,
// // //     height: 120,
// // //     borderRadius: 60,
// // //     backgroundColor: '#e1e1e1',
// // //   },
// // //   editImageButton: {
// // //     position: 'absolute',
// // //     bottom: 0,
// // //     right: 0,
// // //     backgroundColor: '#007AFF',
// // //     width: 36,
// // //     height: 36,
// // //     borderRadius: 18,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     borderWidth: 3,
// // //     borderColor: '#fff',
// // //   },
// // //   userInfo: {
// // //     alignItems: 'center',
// // //     marginBottom: 15,
// // //   },
// // //   userName: {
// // //     fontSize: 24,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 5,
// // //   },
// // //   verifiedBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#E8F5E9',
// // //     paddingHorizontal: 10,
// // //     paddingVertical: 5,
// // //     borderRadius: 15,
// // //   },
// // //   verifiedText: {
// // //     color: '#4CAF50',
// // //     marginRight: 5,
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //   },
// // //   editButton: {
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 8,
// // //     borderRadius: 20,
// // //     backgroundColor: '#007AFF',
// // //   },
// // //   editButtonText: {
// // //     color: '#fff',
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //   },
// // //   statsContainer: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-around',
// // //     padding: 20,
// // //     backgroundColor: '#fff',
// // //     marginTop: 10,
// // //   },
// // //   statItem: {
// // //     alignItems: 'center',
// // //   },
// // //   statValue: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginTop: 8,
// // //   },
// // //   statLabel: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginTop: 4,
// // //     textAlign: 'center',
// // //   },
// // //   moveCard: {
// // //     backgroundColor: '#fff',
// // //     margin: 10,
// // //     padding: 15,
// // //     borderRadius: 15,
// // //     shadowColor: '#000',
// // //     shadowOffset: {
// // //       width: 0,
// // //       height: 2,
// // //     },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 3.84,
// // //     elevation: 5,
// // //   },
// // //   cardTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 10,
// // //   },
// // //   moveDetails: {
// // //     backgroundColor: '#F5F9FF',
// // //     padding: 15,
// // //     borderRadius: 10,
// // //   },
// // //   moveLocation: {
// // //     flexDirection: 'row',
// // //     alignItems: 'flex-start',
// // //     marginBottom: 10,
// // //   },
// // //   locationText: {
// // //     marginLeft: 10,
// // //   },
// // //   fromTo: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //     marginBottom: 5,
// // //   },
// // //   moveDate: {
// // //     fontSize: 15,
// // //     color: '#007AFF',
// // //     fontWeight: '600',
// // //     marginTop: 5,
// // //   },
// // //   section: {
// // //     backgroundColor: '#fff',
// // //     padding: 20,
// // //     marginTop: 10,
// // //   },
// // //   sectionTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '600',
// // //     color: '#333',
// // //     marginBottom: 15,
// // //   },
// // //   infoRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginBottom: 15,
// // //     padding: 10,
// // //     backgroundColor: '#F8F9FA',
// // //     borderRadius: 10,
// // //   },
// // //   infoText: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //     marginLeft: 15,
// // //   },
// // //   preferencesContainer: {
// // //     backgroundColor: '#F8F9FA',
// // //     borderRadius: 10,
// // //     padding: 15,
// // //   },
// // //   preferenceItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginBottom: 15,
// // //   },
// // //   preferenceText: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //     marginLeft: 15,
// // //   },
// // //   additionalInfoContainer: {
// // //     backgroundColor: '#F8F9FA',
// // //     borderRadius: 10,
// // //     padding: 15,
// // //   },
// // //   infoItem: {
// // //     marginBottom: 15,
// // //   },
// // //   infoLabel: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginBottom: 5,
// // //   },
// // //   infoValue: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //   },
// // //   aboutText: {
// // //     fontSize: 16,
// // //     color: '#666',
// // //     lineHeight: 24,
// // //     marginBottom: 15,
// // //   },
// // // });

// // // export default ProfilePage;


// // // // import React from 'react';
// // // // import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
// // // // import { FontAwesome, Ionicons } from '@expo/vector-icons';
// // // // import { useUser } from '@clerk/clerk-expo';

// // // // const Profile = () => {
// // // //     const { user } =  useUser();

// // // //     return (
// // // //         <ScrollView contentContainerStyle={styles.container}>
// // // //                 <View style={{
// // // //                     paddingLeft: 8,
// // // //                 }}>
// // // //                     <Text style={styles.userNameText}>
// // // //                         {user?.fullName}
// // // //                     </Text>
// // // //                     <Text style={{
// // // //                         fontSize: 18,
// // // //                         fontWeight: '500',
// // // //                         color: '#828282',
// // // //                         marginBottom: 10,
// // // //                     }}>
// // // //                         +254 74197359
// // // //                     </Text>

// // // //                 <View>
// // // //                     <TouchableOpacity>
// // // //                         <View style={{
// // // //                             flexDirection: 'row',
// // // //                             alignItems: 'center',
// // // //                             marginBottom: 10,
// // // //                         }}>
// // // //                             <Ionicons name="location-outline" size={24} color="#828282" />
// // // //                             <Text style={{
// // // //                                 marginLeft: 5,
// // // //                                 fontSize: 16,
// // // //                             }}>
// // // //                                 Kenya, Nairobi
// // // //                             </Text>
// // // //                         </View>
// // // //                     </TouchableOpacity>
// // // //                 </View>
// // // //             </View>
// // // //         </ScrollView>
// // // //     );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //     container: {
// // // //         flex: 1,
// // // //         backgroundColor: '#f7f9fc',
// // // //         padding: 20,
// // // //     },
// // // //     userNameText: {
// // // //         fontSize: 24,
// // // //         fontWeight: 'bold',
// // // //         marginBottom: 5,
// // // //     },

// // // // });

// // // // export default Profile;
