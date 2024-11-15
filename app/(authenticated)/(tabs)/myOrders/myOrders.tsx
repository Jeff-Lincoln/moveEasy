import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { supabase } from '@/supabase/supabase';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

interface Order {
  payment_id: number;
  user_id: string;
  user_name: string;
  origin: string;
  destination: string;
  distance: number;
  distance_price: number;
  duration: number;
  vehicle: string;
  date_time: string;
  total_price: number;
  created_at: string;
  subtotal: number;
  shipping: number;
  tax: number;
  status?: 'completed' | 'pending' | 'cancelled';
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fetchOrders = async () => {
    try {
      setError(null);
      if (!user?.id) {
        setError("User not logged in.");
        return;
      }
      
      const { data, error: supabaseError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setOrders(data || []);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
      Alert.alert('Error', 'Failed to load orders. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.id]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'pending': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.payment_id}</Text>
          <Text style={styles.dateText}>
            {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#007AFF" />
          <Text style={styles.locationText}>{item.origin || 'N/A'}</Text>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationRow}>
          <Ionicons name="location" size={20} color="#34C759" />
          <Text style={styles.locationText}>{item.destination || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.tripDetails}>
        <View style={styles.tripDetailItem}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>{item.distance?.toFixed(1)} km</Text>
        </View>
        <View style={styles.tripDetailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{Math.round(item.duration || 0)} min</Text>
        </View>
        <View style={styles.tripDetailItem}>
          <Text style={styles.detailLabel}>Vehicle</Text>
          <Text style={styles.detailValue}>{item.vehicle || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.costBreakdown}>
        <Text style={styles.costBreakdownTitle}>Cost Breakdown</Text>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Subtotal</Text>
          <Text style={styles.costValue}>${item.subtotal?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Shipping</Text>
          <Text style={styles.costValue}>${item.shipping?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Tax</Text>
          <Text style={styles.costValue}>${item.tax?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={[styles.costRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ${(item.subtotal + item.shipping + item.tax).toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.payment_id.toString()}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>Your order history will appear here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  listContainer: { padding: 16 },
  cardContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderNumber: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  dateText: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  locationContainer: { backgroundColor: '#F2F2F7', padding: 12, borderRadius: 8, marginBottom: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  locationText: { fontSize: 16, color: '#000000', marginLeft: 8, flex: 1 },
  locationDivider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 8, marginLeft: 28 },
  tripDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  tripDetailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 12, color: '#8E8E93' },
  detailValue: { fontSize: 16, fontWeight: '600', color: '#000000' },
  divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 16 },
  costBreakdown: { paddingHorizontal: 8, marginBottom: 16 },
  costBreakdownTitle: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 8 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  costLabel: { fontSize: 14, color: '#8E8E93' },
  costValue: { fontSize: 14, fontWeight: '600', color: '#000000' },
  totalRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#000000' },
  totalValue: { fontSize: 16, fontWeight: '600', color: '#000000' },
  detailsButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#F2F2F7', borderRadius: 8 },
  detailsButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginRight: 8 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16, color: '#8E8E93' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: 8, fontSize: 16, color: '#FF3B30', textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#8E8E93' },
  emptySubtext: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
});

export default MyOrders;




// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Platform,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { supabase } from '@/supabase/supabase';
// import { format } from 'date-fns';
// import { Ionicons } from '@expo/vector-icons';

// interface Order {
//   payment_id: number;
//   user_id: string;
//   user_name: string;
//   origin: string;
//   destination: string;
//   distance: number;
//   distance_price: number;
//   duration: number;
//   vehicle: string;
//   date_time: string;
//   total_price: number;
//   created_at: string;
//   subtotal: number;
//   shipping: number;
//   tax: number;
//   status?: 'completed' | 'pending' | 'cancelled';
// }

// const MyOrders = () => {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchOrders = async () => {
//     try {
//       setError(null);
//       const { data, error: supabaseError } = await supabase
//         .from('payments')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (supabaseError) {
//         throw supabaseError;
//       }

//       if (data) {
//         setOrders(data);
//       }
//     } catch (err) {
//       setError('Failed to fetch orders. Please try again later.');
//       Alert.alert('Error', 'Failed to load orders. Pull down to refresh.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchOrders();
//   }, []);

//   const getStatusColor = (status?: string) => {
//     switch (status) {
//       case 'completed':
//         return '#34C759';
//       case 'pending':
//         return '#FF9500';
//       case 'cancelled':
//         return '#FF3B30';
//       default:
//         return '#8E8E93';
//     }
//   };

//   const renderOrderCard = ({ item }: { item: Order }) => (
//     <View style={styles.cardContainer}>
//       <View style={styles.cardHeader}>
//         <View>
//           <Text style={styles.orderNumber}>Order #{item.payment_id}</Text>
//           <Text style={styles.dateText}>
//             {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
//           </Text>
//         </View>
//         <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//           <Text style={styles.statusText}>{item.status || 'N/A'}</Text>
//         </View>
//       </View>

//       <View style={styles.locationContainer}>
//         <View style={styles.locationRow}>
//           <Ionicons name="location" size={20} color="#007AFF" />
//           <Text style={styles.locationText}>{item.origin || 'N/A'}</Text>
//         </View>
//         <View style={styles.locationDivider} />
//         <View style={styles.locationRow}>
//           <Ionicons name="location" size={20} color="#34C759" />
//           <Text style={styles.locationText}>{item.destination || 'N/A'}</Text>
//         </View>
//       </View>

//       <View style={styles.tripDetails}>
//         <View style={styles.tripDetailItem}>
//           <Text style={styles.detailLabel}>Distance</Text>
//           <Text style={styles.detailValue}>{item.distance?.toFixed(1)} km</Text>
//         </View>
//         <View style={styles.tripDetailItem}>
//           <Text style={styles.detailLabel}>Duration</Text>
//           <Text style={styles.detailValue}>{Math.round(item.duration || 0)} min</Text>
//         </View>
//         <View style={styles.tripDetailItem}>
//           <Text style={styles.detailLabel}>Vehicle</Text>
//           <Text style={styles.detailValue}>{item.vehicle || 'N/A'}</Text>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.costBreakdown}>
//         <Text style={styles.costBreakdownTitle}>Cost Breakdown</Text>
//         <View style={styles.costRow}>
//           <Text style={styles.costLabel}>Subtotal</Text>
//           <Text style={styles.costValue}>${item.subtotal?.toFixed(2) || '0.00'}</Text>
//         </View>
//         <View style={styles.costRow}>
//           <Text style={styles.costLabel}>Shipping</Text>
//           <Text style={styles.costValue}>${item.shipping?.toFixed(2) || '0.00'}</Text>
//         </View>
//         <View style={styles.costRow}>
//           <Text style={styles.costLabel}>Tax</Text>
//           <Text style={styles.costValue}>${item.tax?.toFixed(2) || '0.00'}</Text>
//         </View>
//         <View style={[styles.costRow, styles.totalRow]}>
//           <Text style={styles.totalLabel}>Total</Text>
//           <Text style={styles.totalValue}>
//             ${(item.subtotal + item.shipping + item.tax).toFixed(2)}
//           </Text>
//         </View>
//       </View>

//       <TouchableOpacity style={styles.detailsButton}>
//         <Text style={styles.detailsButtonText}>View Details</Text>
//         <Ionicons name="chevron-forward" size={20} color="#007AFF" />
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#007AFF" />
//         <Text style={styles.loadingText}>Loading your orders...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />
      
//       {/* <View style={styles.header}>
//         <Text style={styles.headerTitle}>My Orders</Text>
//       </View> */}

//       {error ? (
//         <View style={styles.errorContainer}>
//           <Ionicons name="alert-circle" size={24} color="#FF3B30" />
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={orders}
//           keyExtractor={(item) => item.payment_id.toString()}
//           renderItem={renderOrderCard}
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Ionicons name="document-text-outline" size={48} color="#8E8E93" />
//               <Text style={styles.emptyText}>No orders found</Text>
//               <Text style={styles.emptySubtext}>Your order history will appear here</Text>
//             </View>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F2F2F7',
//   },
//   header: {
//     padding: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5EA',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000000',
//   },
//   listContainer: {
//     padding: 16,
//   },
//   cardContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     marginBottom: 16,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   orderNumber: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000000',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginTop: 4,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   statusText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//     textTransform: 'capitalize',
//   },
//   locationContainer: {
//     backgroundColor: '#F2F2F7',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 4,
//   },
//   locationText: {
//     fontSize: 16,
//     color: '#000000',
//     marginLeft: 8,
//     flex: 1,
//   },
//   locationDivider: {
//     height: 1,
//     backgroundColor: '#E5E5EA',
//     marginVertical: 8,
//     marginLeft: 28,
//   },
//   tripDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   tripDetailItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#8E8E93',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000000',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#E5E5EA',
//     marginVertical: 16,
//   },
//   costBreakdown: {
//     marginBottom: 16,
//   },
//   costBreakdownTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000000',
//     marginBottom: 12,
//   },
//   costRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   costLabel: {
//     fontSize: 16,
//     color: '#8E8E93',
//   },
//   costValue: {
//     fontSize: 16,
//     color: '#000000',
//   },
//   totalRow: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E5EA',
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000000',
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#007AFF',
//   },
//   detailsButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#F2F2F7',
//     borderRadius: 8,
//   },
//   detailsButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#007AFF',
//     marginRight: 4,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#8E8E93',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#FF3B30',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#000000',
//     marginTop: 16,
//   },
//   emptySubtext: {
//     fontSize: 16,
//     color: '#8E8E93',
//     marginTop: 8,
//     textAlign: 'center',
//   },
// });

// export default MyOrders;