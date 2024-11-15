import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { FontAwesome5, MaterialIcons, AntDesign, Ionicons, Octicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/context/store';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/supabase/supabase';
import { useRouter } from 'expo-router';

// Enhanced type definitions
type PaymentMethod = 'credit-card' | 'paypal' | 'mpesa';
type PriorityType = 'low' | 'medium' | 'high';

// type PaymentData = {
//   user_id: string;
//   user_name: string;
//   origin: string;
//   destination: string;
//   distance: string;
//   duration: any;
//   vehicle: string;
//   schedule_date: any;
//   schedule_time: string[];
//   total_price: string;
//   created_at: string;
// };
// type PaymentData = {
//   user_id: string;
//   user_name: string;
//   origin: string;
//   destination: string;
//   distance: string;
//   duration: any;
//   vehicle: string;
//   schedule_date: any;
//   schedule_time: string[]; // Changed to string array to match database expectation
//   total_price: string;
//   created_at: string;
// };

// Update the PaymentData type
type PaymentData = {
  user_id: string;
  user_name: string;
  origin: string;
  destination: string;
  distance: string;
  distance_price: number;
  duration: any;
  vehicle: string;
  date_time: string;
  total_price: string;
  created_at: string;
};

interface Item {
  id: string;
  name: string;
  checked: boolean;
  timestamp: Date;
  priority: PriorityType;
}

interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface PaymentProps {
  checklistItems?: Item[];
  onPaymentComplete?: (success: boolean) => void;
}

const Payment: React.FC<PaymentProps> = ({ 
  checklistItems = [], 
  onPaymentComplete 
}) => {
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  // Redux state
  const dispatch = useDispatch();

  const router = useRouter();

// Modified formatTimeForDB function to return an array
const formatTimeForDB = (time: string | undefined): string[] => {
  if (!time) return []; // Return empty array if no time provided
  
  // If time contains a range (e.g. "3:00 PM - 4:00 PM"), split it
  const timeRange = time.split('-').map(t => t.trim());
  
  // Return array of times
  return timeRange;
};

  const { user } = useUser();
  // console.log("User => : ", user?.firstName)
  const {
    origin,
    destination,
    dateTime,
    distance = 0,
    duration
  } = useSelector((state: RootState) => state.nav);
  
  // const selectedVehicle = useSelector((state: RootState) => state.booking.selectedVehicle);
  const selectedVehicle = useSelector((state: RootState) => state.booking.selectedVehicle);




  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit-card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // Animation effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
      // console.log("Date_Time => () = ", paymentData.date_time.toString())
    ]).start();
  }, []);

  // Enhanced cost calculation
  const calculateCosts = () => {
    // const myvehiclePrice = selectedVehicle?.price
    const basePrice = selectedVehicle?.price ? parseInt(selectedVehicle.price) : 0;



    //i need the basePrive above to show the vehicle price in Kshs not other info.eg..if vehicle.Price= 16,000 then it should show 16,000 instead of 16Kshs
    // const basePrice = selectedVehicle?.price ? parseFloat(selectedVehicle.price.replace(/Kshs\s*/, '').trim()) : 0;

    const distancePrice = distance * 100; // Ksh 50 per km
    const shippingCost = 5000;
    const tax: any = (basePrice + distancePrice) * 0.16; // 16% VAT

    return {
      basePrice,
      distancePrice,
      shippingCost,
      tax,
      totalCost: basePrice + distancePrice + shippingCost + tax
    };
  };

  const costs = calculateCosts();

  // Enhanced validation
  const validateCardDetails = (): boolean => {
    const { number, name, expiry, cvv } = cardDetails;
    const errors = [];

    if (!number || number.replace(/\s/g, '').length !== 16) {
      errors.push('Please enter a valid 16-digit card number');
    }

    if (!name || name.length < 3) {
      errors.push('Please enter the complete cardholder name');
    }

    if (!expiry || !expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      errors.push('Please enter a valid expiry date (MM/YY)');
    } else {
      const [month, year] = expiry.split('/');
      const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expDate < new Date()) {
        errors.push('Card has expired');
      }
    }

    if (!cvv || !cvv.match(/^\d{3,4}$/)) {
      errors.push('Please enter a valid CVV (3-4 digits)');
    }

    if (errors.length > 0) {
      Alert.alert('Validation Error', errors.join('\n'));
      return false;
    }

    return true;
  };



  // Enhanced input formatting
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.substring(0, 16);
    const formatted = limited.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails(prev => ({ ...prev, number: formatted }));
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const month = cleaned.substring(0, 2);
      const year = cleaned.substring(2, 4);
      const monthNum = parseInt(month);
      if (monthNum > 12) {
        setCardDetails(prev => ({ ...prev, expiry: '12/' + year }));
      } else {
        setCardDetails(prev => ({ 
          ...prev, 
          expiry: `${month}${year.length ? '/' : ''}${year}` 
        }));
      }
    } else {
      setCardDetails(prev => ({ ...prev, expiry: cleaned }));
    }
  };

  const getPriorityColor = (priority: PriorityType) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336'
    };
    return colors[priority];
  };
  // console.log("vehiclePrice: =>", selectedVehicle?.price)

  // const paymentData: any = {
  //   user_id: user?.id,
  //   user_name: `${user?.firstName} ${user?.lastName}`,
  //   origin: origin?.address || 'N/A',
  //   destination: destination?.address || 'N/A',
  //   distance: distance?.toFixed(1),
  //   duration: duration || 'N/A',
  //   vehicle: selectedVehicle?.name || 'N/A',
  //   schedule_date: dateTime?.date || 'N/A',
  //   schedule_time: dateTime?.time || 'N/A',
  //   total_price: costs.totalCost.toFixed(2),
  //   created_at: new Date().toISOString(),
  // };


  const paymentData: PaymentData = {
    user_id: user?.id || 'N/A',
    user_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    origin: origin?.address || 'N/A',
    destination: destination?.address || 'N/A',
    distance: distance?.toFixed(1) || 'N/A',
    distance_price: distance ? distance * 100 : 0,
    duration: duration || 'N/A',
    vehicle: selectedVehicle?.name || 'N/A',
    date_time: dateTime?.date && dateTime?.time
      ? `${dateTime.date} ${formatTimeForDB(dateTime.time).join(', ')}`
      : 'N/A',
    total_price: costs.totalCost.toFixed(2),
    created_at: new Date().toISOString(),
  };
  
  // Update the payment data construction
// const paymentData: PaymentData = {
//   user_id: user?.id || 'N/A',
//   user_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
//   origin: origin?.address || 'N/A',
//   destination: destination?.address || 'N/A',
//   distance: distance?.toFixed(1) || 'N/A',
//   duration: duration || 'N/A',
//   vehicle: selectedVehicle?.name || 'N/A',
//   schedule_date: dateTime?.date || 'N/A',
//   schedule_time: formatTimeForDB(dateTime?.time), // Now returns array
//   total_price: costs.totalCost.toFixed(2),
//   created_at: new Date().toISOString(),
// };

  // Function to handle saving payment data to the database
const savePaymentData = async (paymentData: PaymentData): Promise<{ success: boolean; data?: any; message?: string }> => {
  try {
    // Use date_time as a plain string if not null
    const cleanedPaymentData = {
      ...paymentData,
      date_time: paymentData.date_time !== 'N/A' ? paymentData.date_time : null,
    };

    const { data, error } = await supabase
      .from('payments') // Replace with your actual table name
      .insert([cleanedPaymentData]);

    if (error) {
      console.error('Error saving payment data:', error);
      return { success: false, message: error.message };
    }

    console.log('Payment data saved successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error saving payment data:', error);
    return { success: false, message: error.message };
  }
};

// Enhanced payment handling
const handlePayment = async () => {
  if (selectedPayment === 'credit-card' && !validateCardDetails()) return;

  setIsLoading(true);
  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

 

     // Save payment data to the database
     const result = await savePaymentData(paymentData);
     if (result.success) {
       Animated.sequence([
         Animated.spring(slideAnim, {
           toValue: -50,
           speed: 12,
           bounciness: 8,
           useNativeDriver: true,
         }),
         Animated.spring(slideAnim, {
           toValue: 0,
           speed: 12,
           bounciness: 8,
           useNativeDriver: true,
         })
       ]).start();


    // Success animation and alert
    Animated.sequence([
      Animated.spring(slideAnim, {
        toValue: -50,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      })
    ]).start();

Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully!\nA confirmation email will be sent shortly.',
          [
            {
              text: 'OK',
              onPress: () => onPaymentComplete?.(true)
            }
          ]
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      Alert.alert(
        'Payment Failed',
        'There was an error processing your payment. Please try again or contact support.',
        [
          { text: 'Try Again', style: 'default' },
          { text: 'cancel', style: 'cancel' }
        ]
      );
      onPaymentComplete?.(false);
    } finally {
      setIsLoading(false);
      router.push('/(authenticated)/(tabs)/myOrders/myOrders');
    }
  };



  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Details</Text>
          <Text style={styles.headerSubtitle}>Complete your booking securely</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>From</Text>
              <Text style={styles.summaryValue}>{origin?.address || 'N/A'}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>To</Text>
              <Text style={styles.summaryValue}>{destination?.address || 'N/A'}</Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Distance</Text>
              <Text style={styles.summaryValue}>
                {distance ? `${distance.toFixed(1)} km` : 'N/A'}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {duration ? `${duration} hrs` : 'N/A'}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>
                {selectedVehicle ? `${selectedVehicle.name}` : 'N/A'}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Schedule</Text>
              <Text style={styles.summaryValue}>
                {dateTime ? `${dateTime.date}\n${dateTime.time}` : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.costBreakdown}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Base Price</Text>
              <Text style={styles.costValue}>Ksh {costs.basePrice.toFixed(2)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Distance Cost</Text>
              <Text style={styles.costValue}>Ksh {costs.distancePrice.toFixed(2)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Shipping</Text>
              <Text style={styles.costValue}>Ksh {costs.shippingCost.toFixed(2)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>VAT (16%)</Text>
              <Text style={styles.costValue}>Ksh {costs.tax.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.costItem, styles.totalItem]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>Ksh {costs.totalCost.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {checklistItems.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Octicons name="checklist" size={24} color="#007bff" />
              <Text style={styles.sectionTitle}>Items Checklist</Text>
            </View>
            
            {checklistItems.map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <View style={styles.checklistHeader}>
                  <View style={styles.checklistMain}>
                    {item.checked && (
                      <AntDesign name="checkcircle" size={16} color="#4caf50" style={styles.checkIcon} />
                    )}
                    <Text style={[
                      styles.checklistText,
                      item.checked && styles.checkedItem
                    ]}>
                      {item.name}
                    </Text>
                  </View>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(item.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{item.priority}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="payment" size={24} color="#007bff" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          
          <View style={styles.paymentOptions}>
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                styles.creditCard,
                selectedPayment === 'credit-card' && styles.selectedPayment
              ]}
              onPress={() => setSelectedPayment('credit-card')}
            >
              <FontAwesome5 name="credit-card" size={24} color="#fff" />
              <Text style={styles.paymentOptionText}>Card</Text>
            </TouchableOpacity>
            
            {/* <TouchableOpacity 
              style={[
                styles.paymentOption,
                styles.mpesa,
                selectedPayment === 'mpesa' && styles.selectedPayment
              ]}
              onPress={() => setSelectedPayment('mpesa')}
            >
              <MaterialIcons name="phone-android" size={24} color="#fff" />
              <Text style={styles.paymentOptionText}>M-PESA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.paymentOption,
                styles.paypal,
                selectedPayment === 'paypal' && styles.selectedPayment
              ]}
              onPress={() => setSelectedPayment('paypal')}
            >
              <FontAwesome5 name="paypal" size={24} color="#fff" />
              <Text style={styles.paymentOptionText}>PayPal</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {selectedPayment === 'credit-card' && (
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="credit-card" size={24} color="#007bff" />
              <Text style={styles.sectionTitle}>Card Details</Text>
            </View>
            
            <View style={styles.cardDetailsContainer}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={cardDetails.number}
                onChangeText={formatCardNumber}
                maxLength={19}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name"
                placeholderTextColor="#999"
                value={cardDetails.name}
                onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
              />
              
              <View style={styles.cardInfo}>
                <TextInput
                  style={[styles.input, styles.expiryInput]}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cardDetails.expiry}
                  onChangeText={formatExpiry}
                  maxLength={5}
                />
                <TextInput
                  style={[styles.input, styles.cvvInput]}
                  placeholder="CVV"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cardDetails.cvv}
                  onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvv: text }))}
                  maxLength={4}
                  secureTextEntry
                />
              </View>
              
              <View style={styles.securityNote}>
                <Ionicons name="lock-closed" size={16} color="#666" />
                <Text style={styles.securityText}>
                  Your payment information is encrypted and secure
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {selectedPayment === 'mpesa' && (
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="phone-android" size={24} color="#007bff" />
              <Text style={styles.sectionTitle}>M-PESA Payment</Text>
            </View>
            
            <View style={styles.mpesaInstructions}>
              <Text style={styles.mpesaStep}>
                1. Go to M-PESA on your phone
              </Text>
              <Text style={styles.mpesaStep}>
                2. Select "Lipa na M-PESA"
              </Text>
              <Text style={styles.mpesaStep}>
                3. Enter Business No: 247247
              </Text>
              <Text style={styles.mpesaStep}>
                4. Enter Amount: Ksh {costs.totalCost.toFixed(2)}
              </Text>
              <Text style={styles.mpesaStep}>
                5. Enter your M-PESA PIN
              </Text>
              <Text style={styles.mpesaStep}>
                6. Confirm payment with the code sent to your phone
              </Text>
            </View>
          </Animated.View>
        )}

        <TouchableOpacity 
          style={[
            styles.payButton,
            isLoading && styles.payButtonDisabled
          ]} 
          onPress={handlePayment} 
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.loadingText}>Processing payment...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.payButtonText}>
                Pay Ksh {costs.totalCost.toFixed(2)}
              </Text>
              <MaterialIcons name="arrow-forward" size={24} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By proceeding with the payment, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  summaryItem: {
    width: '50%',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  costBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    fontSize: 15,
    color: '#666',
  },
  costValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  checklistItem: {
    marginBottom: 16,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checklistMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    marginRight: 8,
  },
  checklistText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  creditCard: {
    backgroundColor: '#007bff',
  },
  mpesa: {
    backgroundColor: '#4caf50',
  },
  paypal: {
    backgroundColor: '#003087',
  },
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  paymentOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardDetailsContainer: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryInput: {
    flex: 1,
    marginRight: 12,
  },
  cvvInput: {
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  mpesaInstructions: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  mpesaStep: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
    paddingLeft: 24,
    position: 'relative',
  },
  payButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Payment;




// import React, { useState } from 'react';
// import { 
//   StyleSheet, 
//   Text, 
//   View, 
//   TouchableOpacity, 
//   TextInput, 
//   ScrollView, 
//   Alert,
//   ActivityIndicator
// } from 'react-native';
// import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '@/app/context/store';

// // Enhanced type definitions
// type PaymentMethod = 'credit-card' | 'paypal';

// interface Item {
//   id: string;
//   name: string;
//   checked: boolean;
//   timestamp: Date;
//   priority: 'low' | 'medium' | 'high';
// }

// interface CardDetails {
//   number: string;
//   name: string;
//   expiry: string;
//   cvv: string;
// }

// interface PaymentProps {
//   checklistItems?: Item[];
//   onPaymentComplete?: (success: boolean) => void;
// }

// const Payment: React.FC<PaymentProps> = ({ 
//   checklistItems = [], 
//   onPaymentComplete 
// }) => {
//   // Redux state
//   const dispatch = useDispatch();
//   const {
//     origin,
//     destination,
//     dateTime,
//     distance,
//     duration
//   } = useSelector((state: RootState) => state.nav);
  
//   // const selectedVehicle = useSelector((state: RootState) => state.vehicle.selectedVehicle);
//   const selectedVehicle = useSelector((state: RootState) => state.booking.selectedVehicle);

//   // Local state
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit-card');
//   const [cardDetails, setCardDetails] = useState<CardDetails>({
//     number: '',
//     name: '',
//     expiry: '',
//     cvv: ''
//   });

//   // Calculate costs
//   const calculateCosts = () => {
//     const basePrice = selectedVehicle?.price ? parseFloat(selectedVehicle.price.replace('$', '')) : 0;
//     const distancePrice = distance ? distance * 50 : 0; // $0.50 per km
//     const shippingCost = 100;

//     return {
//       basePrice,
//       distancePrice,
//       shippingCost,
//       totalCost: basePrice + distancePrice + shippingCost
//     };
//   };

//   const costs = calculateCosts();

//   // Validate card details
//   const validateCardDetails = (): boolean => {
//     const { number, name, expiry, cvv } = cardDetails;

//     if (!number || number.length < 16) {
//       Alert.alert('Invalid Card', 'Please enter a valid card number');
//       return false;
//     }

//     if (!name) {
//       Alert.alert('Invalid Name', 'Please enter the cardholder name');
//       return false;
//     }

//     if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
//       Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
//       return false;
//     }

//     if (!cvv || cvv.length < 3) {
//       Alert.alert('Invalid CVV', 'Please enter a valid CVV');
//       return false;
//     }

//     return true;
//   };

//   // Handle payment submission
//   const handlePayment = async () => {
//     if (!validateCardDetails()) return;

//     setIsLoading(true);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 2000));

//       Alert.alert(
//         'Payment Successful',
//         'Your payment has been processed successfully!',
//         [
//           {
//             text: 'OK',
//             onPress: () => onPaymentComplete?.(true)
//           }
//         ]
//       );
//     } catch (error) {
//       Alert.alert('Payment Failed', 'Please try again later');
//       onPaymentComplete?.(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Format card input
//   const formatCardNumber = (text: string) => {
//     const cleaned = text.replace(/\D/g, '');
//     const limited = cleaned.substring(0, 16);
//     const formatted = limited.replace(/(\d{4})/g, '$1 ').trim();
//     setCardDetails(prev => ({ ...prev, number: formatted }));
//   };

//   // Format expiry date
//   const formatExpiry = (text: string) => {
//     const cleaned = text.replace(/\D/g, '');
//     if (cleaned.length >= 2) {
//       const month = cleaned.substring(0, 2);
//       const year = cleaned.substring(2, 4);
//       setCardDetails(prev => ({ 
//         ...prev, 
//         expiry: `${month }${year.length ? '/' : ''}${year}` 
//       }));
//     } else {
//       setCardDetails(prev => ({ ...prev, expiry: cleaned }));
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Payment Details</Text>
//         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Order Summary</Text>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>From:</Text>
//           <Text style={styles.summaryValue}>{origin?.address || 'N/A'}</Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>To:</Text>
//           <Text style={styles.summaryValue}>{destination?.address || 'N/A'}</Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>Distance:</Text>
//           <Text style={styles.summaryValue}>
//             {distance ? `${distance.toFixed(1)} km` : 'N/A'}
//           </Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>Duration:</Text>
//           <Text style={styles.summaryValue}>
//             {duration ? `${duration} hrs` : 'N/A'}
//           </Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>Vehicle:</Text>
//           <Text style={styles.summaryValue}>
//             {selectedVehicle ? `${selectedVehicle.name} - ${selectedVehicle.price}` : 'N/A'}
//           </Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>Date & Time:</Text>
//           <Text style={styles.summaryValue}>
//             {dateTime ? `${dateTime.date} ${dateTime.time}` : 'N/A'}
//           </Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>Distance Cost:</Text>
//           <Text style={styles.summaryValue}>Kshs{costs.distancePrice.toFixed(2)}</Text>
//         </View>
//         <View style={styles.summaryItem}>
//           <Text style={styles.summaryText}>Shipping:</Text>
//           <Text style={styles.summaryValue}>Kshs{costs.shippingCost.toFixed(2)}</Text>
//         </View>
//         <View style={[styles.summaryItem, styles.totalItem]}>
//           <Text style={styles.totalText}>Total:</Text>
//           <Text style={styles.totalAmount}>Kshs{costs.totalCost.toFixed(2)}</Text>
//         </View>
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Checklist Summary</Text>
//         {checklistItems.length > 0 ? (
//           checklistItems.map((item) => (
//             <View key={item.id} style={styles.checklistItem}>
//               <View style={styles.checklistHeader}>
//                 <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
//                   {item.name}
//                 </Text>
//                 {item.checked && (
//                   <AntDesign name="checkcircle" size={16} color="#4caf50" />
//                 )}
//               </View>
//               <Text style={[styles.priorityText, styles[`priority${item.priority}`]]}>
//                 Priority: {item.priority}
//               </Text>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noItemsText}>No checklist items added</Text>
//         )}
//       </View>

//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Payment Method</Text>
//         <View style={styles.paymentOptions}>
//           <TouchableOpacity 
//             style={[
//               styles.paymentOption,
//               styles.creditCard,
//               selectedPayment === 'credit-card' && styles.selectedPayment
//             ]}
//             onPress={() => setSelectedPayment('credit-card')}
//           >
//             <FontAwesome5 name="credit-card" size={24} color="#fff" />
//             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={[
//               styles.paymentOption,
//               styles.paypal,
//               selectedPayment === 'paypal' && styles.selectedPayment
//             ]}
//             onPress={() => setSelectedPayment('paypal')}
//           >
//             <MaterialIcons name="payment" size={24} color="#fff" />
//             <Text style={styles.paymentOptionText}>PayPal</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {selectedPayment === 'credit-card' && (
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Card Details</Text>
//           <TextInput
//             style ={styles.input}
//             placeholder="Card Number"
//             keyboardType="numeric"
//             value={cardDetails.number}
//             onChangeText={formatCardNumber}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Cardholder Name"
//             value={cardDetails.name}
//             onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
//           />
//           <View style={styles.cardInfo}>
//             <TextInput
//               style={[styles.input, styles.expiryInput]}
//               placeholder="MM/YY"
//               keyboardType="numeric"
//               value={cardDetails.expiry}
//               onChangeText={formatExpiry}
//             />
//             <TextInput
//               style={[styles.input, styles.cvvInput]}
//               placeholder="CVV"
//               keyboardType="numeric"
//               value={cardDetails.cvv}
//               onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvv: text }))}
//             />
//           </View>
//         </View>
//       )}

//       <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isLoading}>
//         {isLoading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.payButtonText}>Pay ${costs.totalCost.toFixed(2)}</Text>
//         )}
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: '#f3f4f6', flex: 1 },
//   header: { marginBottom: 20 },
//   headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
//   headerSubtitle: { fontSize: 16, color: '#777' },
//   card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 20, elevation: 2 },
//   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//   summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
//   summaryText: { fontSize: 16, color: '#333' },
//   summaryValue: { fontSize: 16, color: '#555' },
//   totalItem: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 },
//   totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
//   totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
//   checklistItem: { marginBottom: 10 },
//   checklistHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   checklistText: { fontSize: 16, color: '#333' },
//   checkedItem: { textDecorationLine: 'line-through', color: '#777' },
//   priorityText: { fontSize: 14, color: '#555' },
//   prioritylow: { color: '#4caf50' },
//   prioritymedium: { color: '#ff9800' },
//   priorityhigh: { color: '#f44336' },
//   noItemsText: { color: '#888', textAlign: 'center' },
//   paymentOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
//   paymentOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
//   creditCard: { backgroundColor: '#007bff', marginRight: 10 },
//   paypal: { backgroundColor: '#ffcc00' },
//   selectedPayment: { borderWidth: 2, borderColor: '#333' },
//   paymentOptionText: { fontSize: 16, color: '#fff', marginLeft: 8 },
//   input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 },
//   cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
//   expiryInput: { flex: 1, marginRight: 8 },
//   cvvInput: { flex: 1 },
//   payButton: { backgroundColor: '#007bff', padding: 14, borderRadius: 8, alignItems: 'center' },
//   payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
// });

// export default Payment;




// // import React, { useState } from 'react';
// // import { 
// //   StyleSheet, 
// //   Text, 
// //   View, 
// //   TouchableOpacity, 
// //   TextInput, 
// //   ScrollView, 
// //   Alert,
// //   ActivityIndicator
// // } from 'react-native';
// // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
// // import { useSelector, useDispatch } from 'react-redux';
// // import { RootState } from '@/app/context/store';

// // // Enhanced type definitions
// // type PaymentMethod = 'credit-card' | 'paypal';

// // interface Item {
// //   id: string;
// //   name: string;
// //   checked: boolean;
// //   timestamp: Date;
// //   priority: 'low' | 'medium' | 'high';
// // }

// // interface CardDetails {
// //   number: string;
// //   name: string;
// //   expiry: string;
// //   cvv: string;
// // }

// // interface PaymentProps {
// //   checklistItems?: Item[];
// //   onPaymentComplete?: (success: boolean) => void;
// // }

// // const Payment: React.FC<PaymentProps> = ({ 
// //   checklistItems = [], 
// //   onPaymentComplete 
// // }) => {
// //   // Redux state
// //   const dispatch = useDispatch();
// //   const {
// //     origin,
// //     destination,
// //     dateTime,
// //     distance,
// //     duration
// //   } = useSelector((state: RootState) => state.nav);
  
// //   const selectedVehicle = useSelector((state: RootState) => state.vehicle?.selectedVehicle);

// //   // Local state
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit-card');
// //   const [cardDetails, setCardDetails] = useState<CardDetails>({
// //     number: '',
// //     name: '',
// //     expiry: '',
// //     cvv: ''
// //   });

// //   // Calculate costs
// //   const calculateCosts = () => {
// //     const basePrice = selectedVehicle?.price ? parseFloat(selectedVehicle.price) : 0;
// //     const distancePrice = distance ? distance * 0.5 : 0; // $0.50 per km
// //     const shippingCost = 10;
    
// //     return {
// //       basePrice,
// //       distancePrice,
// //       shippingCost,
// //       totalCost: basePrice + distancePrice + shippingCost
// //     };
// //   };

// //   const costs = calculateCosts();

// //   // Validate card details
// //   const validateCardDetails = (): boolean => {
// //     const { number, name, expiry, cvv } = cardDetails;
    
// //     if (!number || number.length < 16) {
// //       Alert.alert('Invalid Card', 'Please enter a valid card number');
// //       return false;
// //     }
    
// //     if (!name) {
// //       Alert.alert('Invalid Name', 'Please enter the cardholder name');
// //       return false;
// //     }
    
// //     if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
// //       Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
// //       return false;
// //     }
    
// //     if (!cvv || cvv.length < 3) {
// //       Alert.alert('Invalid CVV', 'Please enter a valid CVV');
// //       return false;
// //     }

// //     return true;
// //   };

// //   // Handle payment submission
// //   const handlePayment = async () => {
// //     if (!validateCardDetails()) return;
    
// //     setIsLoading(true);
// //     try {
// //       await new Promise(resolve => setTimeout(resolve, 2000));
      
// //       Alert.alert(
// //         'Payment Successful',
// //         'Your payment has been processed successfully!',
// //         [
// //           {
// //             text: 'OK',
// //             onPress: () => onPaymentComplete?.(true)
// //           }
// //         ]
// //       );
// //     } catch (error) {
// //       Alert.alert('Payment Failed', 'Please try again later');
// //       onPaymentComplete?.(false);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Format card input
// //   const formatCardNumber = (text: string) => {
// //     const cleaned = text.replace(/\D/g, '');
// //     const limited = cleaned.substring(0, 16);
// //     const formatted = limited.replace(/(\d{4})/g, '$1 ').trim();
// //     setCardDetails(prev => ({ ...prev, number: formatted }));
// //   };

// //   // Format expiry date
// //   const formatExpiry = (text: string) => {
// //     const cleaned = text.replace(/\D/g, '');
// //     if (cleaned.length >= 2) {
// //       const month = cleaned.substring(0, 2);
// //       const year = cleaned.substring(2, 4);
// //       setCardDetails(prev => ({ 
// //         ...prev, 
// //         expiry: `${month }${year.length ? '/' : ''}${year}` 
// //       }));
// //     } else {
// //       setCardDetails(prev => ({ ...prev, expiry: cleaned }));
// //     }
// //   };

// //   return (
// //     <ScrollView style={styles.container}>
// //       <View style={styles.header}>
// //         <Text style={styles.headerTitle}>Payment Details</Text>
// //         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// //       </View>

// //       <View style={styles.card}>
// //         <Text style={styles.sectionTitle}>Order Summary</Text>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>From:</Text>
// //           <Text style={styles.summaryValue}>{origin?.address || 'N/A'}</Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>To:</Text>
// //           <Text style={styles.summaryValue}>{destination?.address || 'N/A'}</Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>Distance:</Text>
// //           <Text style={styles.summaryValue}>
// //             {distance ? `${distance.toFixed(1)} km` : 'N/A'}
// //           </Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>Duration:</Text>
// //           <Text style={styles.summaryValue}>
// //             {duration ? `${duration} mins` : 'N/A'}
// //           </Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>Vehicle:</Text>
// //           <Text style={styles.summaryValue}>
// //             {selectedVehicle ? `${selectedVehicle.type} - $${costs.basePrice.toFixed(2)}` : 'N/A'}
// //           </Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>Date & Time:</Text>
// //           <Text style={styles.summaryValue}>
// //             {dateTime ? `${dateTime.date} ${dateTime.time}` : 'N/A'}
// //           </Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>Distance Cost:</Text>
// //           <Text style={styles.summaryValue}>${costs.distancePrice.toFixed(2)}</Text>
// //         </View>
// //         <View style={styles.summaryItem}>
// //           <Text style={styles.summaryText}>Shipping:</Text>
// //           <Text style={styles.summaryValue}>${costs.shippingCost.toFixed(2)}</Text>
// //         </View>
// //         <View style={[styles.summaryItem, styles.totalItem]}>
// //           <Text style={styles.totalText}>Total:</Text>
// //           <Text style={styles.totalAmount}>${costs.totalCost.toFixed(2)}</Text>
// //         </View>
// //       </View>

// //       <View style={styles.card}>
// //         <Text style={styles.sectionTitle}>Checklist Summary</Text>
// //         {checklistItems.length > 0 ? (
// //           checklistItems.map((item) => (
// //             <View key={item.id} style={styles.checklistItem}>
// //               <View style={styles.checklistHeader}>
// //                 <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// //                   {item.name}
// //                 </Text>
// //                 {item.checked && (
// //                   <AntDesign name="checkcircle" size={16} color="#4caf50" />
// //                 )}
// //               </View>
// //               <Text style={[styles.priorityText, styles[`priority${item.priority}`]]}>
// //                 Priority: {item.priority}
// //               </Text>
// //             </View>
// //           ))
// //         ) : (
// //           <Text style={styles.noItemsText}>No checklist items added</Text>
// //         )}
// //       </View>

// //       <View style={styles.card}>
// //         <Text style={styles.sectionTitle}>Payment Method</Text>
// //         <View style={styles.paymentOptions}>
// //           <TouchableOpacity 
// //             style={[
// //               styles.paymentOption,
// //               styles.creditCard,
// //               selectedPayment === 'credit-card' && styles.selectedPayment
// //             ]}
// //             onPress={() => setSelectedPayment('credit-card')}
// //           >
// //             <FontAwesome5 name="credit-card" size={24} color="#fff" />
// //             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// //           </TouchableOpacity>
// //           <TouchableOpacity 
// //             style={[
// //               styles.paymentOption,
// //               styles.paypal,
// //               selectedPayment === 'paypal' && styles.selectedPayment
// //             ]}
// //             onPress={() => setSelectedPayment('paypal')}
// //           >
// //             <MaterialIcons name="payment" size={24} color="#fff" />
// //             <Text style={styles.paymentOptionText}>PayPal</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>

// //       {selectedPayment === 'credit-card' && (
// //         <View style={styles.card}>
// //           <Text style={styles.sectionTitle}>Card Details</Text>
// //           <TextInput
// //             style={styles.input}
// //             placeholder="Card Number"
// //             keyboardType="numeric"
// //             value={cardDetails.number}
// //             onChangeText={formatCardNumber}
// //           />
// //           <TextInput
// //             style={styles.input}
// //             placeholder="Cardholder Name"
// //             value={cardDetails.name}
// //             onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
// //           />
// //           <View style={styles.cardInfo}>
// //             <TextInput
// //               style={[styles.input, styles.expiryInput]}
// //               placeholder="MM/YY"
// //               keyboardType="numeric"
// //               value={cardDetails.expiry}
// //               onChangeText={formatExpiry}
// //             />
// //             <TextInput
// //               style={[styles.input, styles.cvvInput]}
// //               placeholder="CVV"
// //               keyboardType="numeric"
// //               value={cardDetails.cvv}
// //               onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvv: text }))}
// //             />
// //           </View>
// //         </View>
// //       )}

// //       <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isLoading}>
// //         {isLoading ? (
// //           <ActivityIndicator size="small" color="#fff" />
// //         ) : (
// //           <Text style={styles.payButtonText}>Pay ${costs.totalCost.toFixed(2)}</Text>
// //         )}
// //       </TouchableOpacity>
// //     </ScrollView>
// //   );
// // };

// // // Styles
// // const styles = StyleSheet.create({
// //   container: { padding: 20, backgroundColor: '#f3f4f6', flex: 1 },
// //   header: { marginBottom: 20 },
// //   headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
// //   headerSubtitle: { fontSize: 16, color: '#777' },
// //   card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 20 },
// //   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
// //   summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
// //   summaryText: { fontSize: 16, color: '#333' },
// //   summaryValue: { fontSize: 16, color: '#555' },
// //   totalItem: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 },
// //   totalText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
// //   totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
// //   checklistItem: { marginBottom: 10 },
// //   checklistHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
// //   checklistText: { fontSize: 16, color: '#333' },
// //   checkedItem: { textDecorationLine: 'line-through', color: '#777' },
// //   priorityText: { fontSize: 14, color: '#555' },
// //   prioritylow: { color: '#4caf50' },
// //   prioritymedium: { color: '#ff9800' },
// //   priorityhigh: { color: '#f44336' },
// //   noItemsText: { color: '#888', textAlign: 'center' },
// //   paymentOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
// //   paymentOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8 },
// //   creditCard: { backgroundColor: '#007bff', marginRight: 10 },
// //   paypal: { backgroundColor: '#ffcc00' },
// //   selectedPayment: { borderWidth: 2, borderColor: '#333' },
// //   paymentOptionText: { fontSize: 16, color: '#fff', marginLeft: 8 },
// //   input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 },
// //   cardInfo: { flexDirection: 'row', justifyContent: 'space-between' },
// //   expiryInput: { flex: 1, marginRight: 8 },
// //   cvvInput: { flex: 1 },
// //   payButton: { backgroundColor: '#007bff', padding: 14, borderRadius: 8, alignItems: 'center' },
// //   payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
// // });

// // export default Payment;






// // // import React, { useState } from 'react';
// // // import { 
// // //   StyleSheet, 
// // //   Text, 
// // //   View, 
// // //   TouchableOpacity, 
// // //   TextInput, 
// // //   ScrollView, 
// // //   Alert,
// // //   ActivityIndicator
// // // } from 'react-native';
// // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
// // // import { useSelector, useDispatch } from 'react-redux';
// // // import { RootState } from '@/app/context/store';

// // // // Enhanced type definitions
// // // type PaymentMethod = 'credit-card' | 'paypal';

// // // interface Item {
// // //   id: string;
// // //   name: string;
// // //   checked: boolean;
// // //   timestamp: Date;
// // //   priority: 'low' | 'medium' | 'high';
// // // }

// // // interface CardDetails {
// // //   number: string;
// // //   name: string;
// // //   expiry: string;
// // //   cvv: string;
// // // }

// // // interface PaymentProps {
// // //   checklistItems?: Item[];
// // //   onPaymentComplete?: (success: boolean) => void;
// // // }

// // // const Payment: React.FC<PaymentProps> = ({ 
// // //   checklistItems = [], 
// // //   onPaymentComplete 
// // // }) => {
// // //   // Redux state
// // //   const dispatch = useDispatch();
// // //   const {
// // //     origin,
// // //     destination,
// // //     dateTime,
// // //     distance,
// // //     duration
// // //   } = useSelector((state: RootState) => state.nav);
  
// // //   const selectedVehicle = useSelector((state: RootState) => state.vehicle?.selectedVehicle);

// // //   // Local state
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit-card');
// // //   const [cardDetails, setCardDetails] = useState<CardDetails>({
// // //     number: '',
// // //     name: '',
// // //     expiry: '',
// // //     cvv: ''
// // //   });

// // //   // Calculate costs
// // //   const calculateCosts = () => {
// // //     const basePrice = selectedVehicle?.price ? parseFloat(selectedVehicle.price) : 0;
// // //     const distancePrice = distance ? distance * 0.5 : 0; // $0.50 per km
// // //     const shippingCost = 10;
    
// // //     return {
// // //       basePrice,
// // //       distancePrice,
// // //       shippingCost,
// // //       totalCost: basePrice + distancePrice + shippingCost
// // //     };
// // //   };

// // //   const costs = calculateCosts();

// // //   // Validate card details
// // //   const validateCardDetails = (): boolean => {
// // //     const { number, name, expiry, cvv } = cardDetails;
    
// // //     if (!number || number.length < 16) {
// // //       Alert.alert('Invalid Card', 'Please enter a valid card number');
// // //       return false;
// // //     }
    
// // //     if (!name) {
// // //       Alert.alert('Invalid Name', 'Please enter the cardholder name');
// // //       return false;
// // //     }
    
// // //     if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
// // //       Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
// // //       return false;
// // //     }
    
// // //     if (!cvv || cvv.length < 3) {
// // //       Alert.alert('Invalid CVV', 'Please enter a valid CVV');
// // //       return false;
// // //     }

// // //     return true;
// // //   };

// // //   // Handle payment submission
// // //   const handlePayment = async () => {
// // //     if (!validateCardDetails()) return;
    
// // //     setIsLoading(true);
// // //     try {
// // //       await new Promise(resolve => setTimeout(resolve, 2000));
      
// // //       Alert.alert(
// // //         'Payment Successful',
// // //         'Your payment has been processed successfully!',
// // //         [
// // //           {
// // //             text: 'OK',
// // //             onPress: () => onPaymentComplete?.(true)
// // //           }
// // //         ]
// // //       );
// // //     } catch (error) {
// // //       Alert.alert('Payment Failed', 'Please try again later');
// // //       onPaymentComplete?.(false);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   // Format card input
// // //   const formatCardNumber = (text: string) => {
// // //     const cleaned = text.replace(/\D/g, '');
// // //     const limited = cleaned.substring(0, 16);
// // //     const formatted = limited.replace(/(\d{4})/g, '$1 ').trim();
// // //     setCardDetails(prev => ({ ...prev, number: formatted }));
// // //   };

// // //   // Format expiry date
// // //   const formatExpiry = (text: string) => {
// // //     const cleaned = text.replace(/\D/g, '');
// // //     if (cleaned.length >= 2) {
// // //       const month = cleaned.substring(0, 2);
// // //       const year = cleaned.substring(2, 4);
// // //       setCardDetails(prev => ({ 
// // //         ...prev, 
// // //         expiry: `${month }${year.length ? '/' : ''}${year}` 
// // //       }));
// // //     } else {
// // //       setCardDetails(prev => ({ ...prev, expiry: cleaned }));
// // //     }
// // //   };

// // //   return (
// // //     <ScrollView style={styles.container}>
// // //       <View style={styles.header}>
// // //         <Text style={styles.headerTitle}>Payment Details</Text>
// // //         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// // //       </View>

// // //       <View style={styles.card}>
// // //         <Text style={styles.sectionTitle}>Order Summary</Text>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>From:</Text>
// // //           <Text style={styles.summaryValue}>{origin?.address || 'N/A'}</Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>To:</Text>
// // //           <Text style={styles.summaryValue}>{destination?.address || 'N/A'}</Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>Distance:</Text>
// // //           <Text style={styles.summaryValue}>
// // //             {distance ? `${distance.toFixed(1)} km` : 'N/A'}
// // //           </Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>Duration:</Text>
// // //           <Text style={styles.summaryValue}>
// // //             {duration ? `${duration} mins` : 'N/A'}
// // //           </Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>Vehicle:</Text>
// // //           <Text style={styles.summaryValue}>
// // //             {selectedVehicle ? `${selectedVehicle.type} - $${costs.basePrice.toFixed(2)}` : 'N/A'}
// // //           </Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>Date & Time:</Text>
// // //           <Text style={styles.summaryValue}>
// // //             {dateTime ? `${dateTime.date} ${dateTime.time}` : 'N/A'}
// // //           </Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>Distance Cost:</Text>
// // //           <Text style={styles.summaryValue}>${costs.distancePrice.toFixed(2)}</Text>
// // //         </View>
// // //         <View style={styles.summaryItem}>
// // //           <Text style={styles.summaryText}>Shipping:</Text>
// // //           <Text style={styles.summaryValue}>${costs.shippingCost.toFixed(2)}</Text>
// // //         </View>
// // //         <View style={[styles.summaryItem, styles.totalItem]}>
// // //           <Text style={styles.totalText}>Total:</Text>
// // //           <Text style={styles.totalAmount}>${costs.totalCost.toFixed(2)}</Text>
// // //         </View>
// // //       </View>

// // //       <View style={styles.card}>
// // //         <Text style={styles.sectionTitle}>Checklist Summary</Text>
// // //         {checklistItems.length > 0 ? (
// // //           checklistItems.map((item) => (
// // //             <View key={item.id} style={styles.checklistItem}>
// // //               <View style={styles.checklistHeader}>
// // //                 <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// // //                   {item.name}
// // //                 </Text>
// // //                 {item.checked && (
// // //                   <AntDesign name="checkcircle" size={16} color="#4caf50" />
// // //                 )}
// // //               </View>
// // //               <Text style={[styles.priorityText, styles[`priority${item.priority}`]]}>
// // //                 Priority: {item.priority}
// // //               </Text>
// // //             </View>
// // //           ))
// // //         ) : (
// // //           <Text style={styles.noItemsText}>No checklist items added</Text>
// // //         )}
// // //       </View>

// // //       <View style={styles.card}>
// // //         <Text style={styles.sectionTitle}>Payment Method</Text>
// // //         <View style={styles.paymentOptions}>
// // //           <TouchableOpacity 
// // //             style={[
// // //               styles.paymentOption,
// // //               styles.creditCard,
// // //               selectedPayment === 'credit-card' && styles.selectedPayment
// // //             ]}
// // //             onPress={() => setSelectedPayment('credit-card')}
// // //           >
// // //             <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // //             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // //           </TouchableOpacity>
// // //           <TouchableOpacity 
// // //             style={[
// // //               styles.paymentOption,
// // //               styles.paypal,
// // //               selectedPayment === 'paypal' && styles.selectedPayment
// // //             ]}
// // //             onPress={() => setSelectedPayment('paypal')}
// // //           >
// // //             <MaterialIcons name="payment" size={24} color="#fff" />
// // //             <Text style={styles.paymentOptionText}>PayPal</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </View>

// // //       {selectedPayment === 'credit-card' && (
// // //         <View style={styles.card}>
// // //           <Text style={styles.sectionTitle}>Card Details</Text>
// // //           <TextInput
// // //             style={styles.input}
// // //             placeholder="Card Number"
// // //             keyboardType="numeric"
// // //             value={cardDetails.number}
// // //             onChangeText={formatCardNumber}
// // //           />
// // //           <TextInput
// // //             style={styles.input}
// // //             placeholder="Name on Card"
// // //             value={cardDetails.name}
// // //             onChangeText={(name) => setCardDetails((prev) => ({ ...prev, name }))}
// // //           />
// // //           <View style={styles.cardDetailsRow}>
// // //             <TextInput
// // //               style={[styles.input, styles.expiryInput]}
// // //               placeholder="MM/YY"
// // //               keyboardType="numeric"
// // //               value={cardDetails.expiry}
// // //               onChangeText={formatExpiry}
// // //             />
// // //             <TextInput
// // //               style={[styles.input, styles.cvvInput]}
// // //               placeholder="CVV"
// // //               keyboardType="numeric"
// // //               secureTextEntry
// // //               value={cardDetails.cvv}
// // //               onChangeText={(cvv) => setCardDetails((prev) => ({ ...prev, cvv }))}
// // //             />
// // //           </View>
// // //         </View>
// // //       )}

// // //       <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={isLoading}>
// // //         {isLoading ? (
// // //           <ActivityIndicator size="small" color="#fff" />
// // //         ) : (
// // //           <Text style={styles.payButtonText}>Pay ${costs.totalCost.toFixed(2)}</Text>
// // //         )}
// // //       </TouchableOpacity>
// // //     </ScrollView>
// // //   );
// // // };

// // // export default Payment;

// // // // Styles
// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     padding: 16,
// // //     backgroundColor: '#f5f5f5',
// // //   },
// // //   header: {
// // //     alignItems: 'center',
// // //     marginBottom: 16,
// // //   },
// // //   headerTitle: {
// // //     fontSize: 22,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   headerSubtitle: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //     marginTop: 4,
// // //   },
// // //   card: {
// // //     backgroundColor: '#fff',
// // //     borderRadius: 8,
// // //     padding: 16,
// // //     marginBottom: 16,
// // //     shadowColor: '#000',
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 5,
// // //     elevation: 5,
// // //   },
// // //   sectionTitle: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //     marginBottom: 8,
// // //   },
// // //   summaryItem: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     paddingVertical: 4,
// // //   },
// // //   summaryText: {
// // //     fontSize: 14,
// // //     color: '#666',
// // //   },
// // //   summaryValue: {
// // //     fontSize: 14,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   totalItem: {
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#eee',
// // //     paddingTop: 8,
// // //   },
// // //   totalText: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#333',
// // //   },
// // //   totalAmount: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: '#4caf50',
// // //   },
// // //   checklistItem: {
// // //     paddingVertical: 8,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#f0f0f0',
// // //   },
// // //   checklistHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //   },
// // //   checklistText: {
// // //     fontSize: 14,
// // //     color: '#333',
// // //   },
// // //   checkedItem: {
// // //     textDecorationLine: 'line-through',
// // //     color: '#999',
// // //   },
// // //   priorityText: {
// // //     fontSize: 12,
// // //     color: '#666',
// // //   },
// // //   prioritylow: {
// // //     color: '#8bc34a',
// // //   },
// // //   prioritymedium: {
// // //     color: '#ff9800',
// // //   },
// // //   priorityhigh: {
// // //     color: '#f44336',
// // //   },
// // //   noItemsText: {
// // //     fontSize: 14,
// // //     color: '#999',
// // //     textAlign: 'center',
// // //   },
// // //   paymentOptions: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     marginVertical: 8,
// // //   },
// // //   paymentOption: {
// // //     flex: 1,
// // //     paddingVertical: 12,
// // //     alignItems: 'center',
// // //     borderRadius: 8,
// // //     marginHorizontal: 4,
// // //   },
// // //   creditCard: {
// // //     backgroundColor: '#0277bd',
// // //   },
// // //   paypal: {
// // //     backgroundColor: '#ffc107',
// // //   },
// // //   selectedPayment: {
// // //     opacity: 0.9,
// // //     borderWidth: 2,
// // //     borderColor: '#333',
// // //   },
// // //   paymentOptionText: {
// // //     fontSize: 14,
// // //     color: '#fff',
// // //     marginTop: 4,
// // //   },
// // //   input: {
// // //     height: 40,
// // //     borderColor: '#ddd',
// // //     borderWidth: 1,
// // //     borderRadius: 8,
// // //     paddingHorizontal: 8,
// // //     marginTop: 8,
// // //     color: '#333',
// // //     fontSize: 14,
// // //   },
// // //   cardDetailsRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //   },
// // //   expiryInput: {
// // //     flex: 1,
// // //     marginRight: 4,
// // //   },
// // //   cvvInput: {
// // //     flex: 1,
// // //     marginLeft: 4,
// // //   },
// // //   payButton: {
// // //     backgroundColor: '#4caf50',
// // //     paddingVertical: 12,
// // //     borderRadius: 8,
// // //     alignItems: 'center',
// // //     marginTop: 16,
// // //   },
// // //   payButtonText: {
// // //     fontSize: 16,
// // //     color: '#fff',
// // //     fontWeight: 'bold',
// // //   },
// // // });




// // // // import React, { useState } from 'react';
// // // // import { 
// // // //   StyleSheet, 
// // // //   Text, 
// // // //   View, 
// // // //   TouchableOpacity, 
// // // //   TextInput, 
// // // //   ScrollView, 
// // // //   Alert,
// // // //   ActivityIndicator
// // // // } from 'react-native';
// // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
// // // // import { useSelector, useDispatch } from 'react-redux';
// // // // import { RootState } from '@/app/context/store';

// // // // // Enhanced type definitions
// // // // type PaymentMethod = 'credit-card' | 'paypal';

// // // // interface Item {
// // // //   id: string;
// // // //   name: string;
// // // //   checked: boolean;
// // // //   timestamp: Date;
// // // //   priority: 'low' | 'medium' | 'high';
// // // // }

// // // // interface CardDetails {
// // // //   number: string;
// // // //   name: string;
// // // //   expiry: string;
// // // //   cvv: string;
// // // // }

// // // // interface PaymentProps {
// // // //   checklistItems?: Item[];
// // // //   onPaymentComplete?: (success: boolean) => void;
// // // // }

// // // // const Payment: React.FC<PaymentProps> = ({ 
// // // //   checklistItems = [], 
// // // //   onPaymentComplete 
// // // // }) => {
// // // //   // Redux state
// // // //   const dispatch = useDispatch();
// // // //   const {
// // // //     origin,
// // // //     destination,
// // // //     dateTime,
// // // //     distance,
// // // //     duration
// // // //   } = useSelector((state: RootState) => state.nav);
  
// // // //   // Ensure state.vehicle is defined before accessing selectedVehicle
// // // //   const selectedVehicle = useSelector((state: RootState) => state.vehicle ? state.vehicle?.selectedVehicle : null);

// // // //   // Local state
// // // //   const [isLoading, setIsLoading] = useState(false);
// // // //   const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('credit-card');
// // // //   const [cardDetails, setCardDetails] = useState<CardDetails>({
// // // //     number: '',
// // // //     name: '',
// // // //     expiry: '',
// // // //     cvv: ''
// // // //   });

// // // //   // Calculate costs
// // // //   const calculateCosts = () => {
// // // //     const basePrice = selectedVehicle?.price ? parseFloat(selectedVehicle.price) : 0;
// // // //     const distancePrice = distance ? distance * 0.5 : 0; // $0.50 per km
// // // //     const shippingCost = 10;
    
// // // //     return {
// // // //       basePrice,
// // // //       distancePrice,
// // // //       shippingCost,
// // // //       totalCost: basePrice + distancePrice + shippingCost
// // // //     };
// // // //   };

// // // //   const costs = calculateCosts();

// // // //   // Validate card details
// // // //   const validateCardDetails = (): boolean => {
// // // //     const { number, name, expiry, cvv } = cardDetails;
    
// // // //     if (!number || number.length < 16) {
// // // //       Alert.alert('Invalid Card', 'Please enter a valid card number');
// // // //       return false;
// // // //     }
    
// // // //     if (!name) {
// // // //       Alert.alert('Invalid Name', 'Please enter the cardholder name');
// // // //       return false;
// // // //     }
    
// // // //     if (!expiry || !expiry.match(/^\d{2}\/\d{2}$/)) {
// // // //       Alert.alert('Invalid Expiry', 'Please enter a valid expiry date (MM/YY)');
// // // //       return false;
// // // //     }
    
// // // //     if (!cvv || cvv.length < 3) {
// // // //       Alert.alert('Invalid CVV', 'Please enter a valid CVV');
// // // //       return false;
// // // //     }

// // // //     return true;
// // // //   };

// // // //   // Handle payment submission
// // // //   const handlePayment = async () => {
// // // //     if (!validateCardDetails()) return;
    
// // // //     setIsLoading(true);
// // // //     try {
// // // //       // Simulate payment processing
// // // //       await new Promise(resolve => setTimeout(resolve, 2000));
      
// // // //       Alert.alert(
// // // //         'Payment Successful',
// // // //         'Your payment has been processed successfully!',
// // // //         [
// // // //           {
// // // //             text: 'OK',
// // // //             onPress: () => onPaymentComplete?.(true)
// // // //           }
// // // //         ]
// // // //       );
// // // //     } catch (error) {
// // // //       Alert.alert('Payment Failed', 'Please try again later');
// // // //       onPaymentComplete?.(false);
// // // //     } finally {
// // // //       setIsLoading(false);
// // // //     }
// // // //   };

// // // //   // Format card input
// // // //   const formatCardNumber = (text: string) => {
// // // //     const cleaned = text.replace(/\D/g, '');
// // // //     const limited = cleaned.substring(0, 16);
// // // //     const formatted = limited.replace(/(\d{4})/g, '$1 ').trim();
// // // //     setCardDetails(prev => ({ ...prev, number: formatted }));
// // // //   };

// // // //   // Format expiry date
// // // //   const formatExpiry = (text: string) => {
// // // //     const cleaned = text.replace(/\D/g, '');
// // // //     if (cleaned.length >= 2) {
// // // //       const month = cleaned.substring(0, 2);
// // // //       const year = cleaned.substring(2, 4);
// // // //       setCardDetails(prev => ({ 
// // // //         ...prev, 
// // // //         expiry: `${month }${year.length ? '/' : ''}${year}` 
// // // //       }));
// // // //     } else {
// // // //       setCardDetails(prev => ({ ...prev, expiry: cleaned }));
// // // //     }
// // // //   };

// // // //   return (
// // // //     <ScrollView style={styles.container}>
// // // //       <View style={styles.header}>
// // // //         <Text style={styles.headerTitle}>Payment Details</Text>
// // // //         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// // // //       </View>

// // // //       <View style={styles.card}>
// // // //         <Text style={styles.sectionTitle}>Order Summary</Text>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>From:</Text>
// // // //           <Text style={styles.summaryValue}>{origin?.address || 'N/A'}</Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>To:</Text>
// // // //           <Text style={styles.summaryValue}>{destination?.address || 'N/A'}</Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>Distance:</Text>
// // // //           <Text style={styles.summaryValue}>
// // // //             {distance ? `${distance.toFixed(1)} km` : 'N/A'}
// // // //           </Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>Duration:</Text>
// // // //           <Text style={styles.summaryValue}>
// // // //             {duration ? `${duration} mins` : 'N/A'}
// // // //           </Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>Vehicle:</Text>
// // // //           <Text style={styles.summaryValue}>
// // // //             {selectedVehicle ? `${selectedVehicle.type} - $${costs.basePrice.toFixed(2)}` : 'N/A'}
// // // //           </Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>Date & Time:</Text>
// // // //           <Text style={styles.summaryValue}>
// // // //             {dateTime ? `${dateTime.date} ${dateTime.time}` : 'N/A'}
// // // //           </Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>Distance Cost:</Text>
// // // //           <Text style={styles.summaryValue}>${costs.distancePrice.toFixed(2)}</Text>
// // // //         </View>
// // // //         <View style={styles.summaryItem}>
// // // //           <Text style={styles.summaryText}>Shipping:</Text>
// // // //           <Text style={styles.summaryValue}>${costs.shippingCost.toFixed(2)}</Text>
// // // //         </View>
// // // //         <View style={[styles.summaryItem, styles.totalItem]}>
// // // //           <Text style={styles.totalText}>Total:</Text>
// // // //           <Text style={styles.totalAmount}>${costs.totalCost.toFixed(2)}</Text>
// // // //         </View>
// // // //       </View>

// // // //       <View style={styles.card}>
// // // //         <Text style={styles.sectionTitle}>Checklist Summary</Text>
// // // //         {checklistItems.length > 0 ? (
// // // //           checklistItems.map((item) => (
// // // //             <View key={item.id} style={styles.checklistItem}>
// // // //               <View style={styles.checklistHeader}>
// // // //                 <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// // // //                   {item.name}
// // // //                 </Text>
// // // //                 {item.checked && (
// // // //                   <AntDesign name="checkcircle" size={16} color="#4caf50" />
// // // //                 )}
// // // //               </View>
// // // //               <Text style={[styles.priorityText, styles[`priority${item.priority}`]]}>
// // // //                 Priority: {item.priority}
// // // //               </Text>
// // // //             </View>
// // // //           ))
// // // //         ) : (
// // // //           <Text style={styles.noItemsText}>No checklist items added</Text>
// // // //         )}
// // // //       </View>

// // // //       <View style={styles.card}>
// // // //         <Text style={styles.sectionTitle}>Payment Method</Text>
// // // //         <View style={styles.paymentOptions}>
// // // //           <TouchableOpacity 
// // // //             style={[
// // // //               styles.paymentOption,
// // // //               styles.creditCard,
// // // //               selectedPayment === 'credit-card' && styles.selectedPayment
// // // //             ]}
// // // //             onPress={() => setSelectedPayment('credit-card')}
// // // //           >
// // // //             <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // //             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // //           </TouchableOpacity>
// // // //           <TouchableOpacity 
// // // //             style={[
// // // //               styles.paymentOption,
// // // //               styles.paypal,
// // // //               selectedPayment === 'paypal' && styles.selectedPayment
// // // //             ]}
// // // //             onPress={() => setSelectedPayment('paypal')}
// // // //           >
// // // //             <MaterialIcons name="payment" size={24} color="#fff" />
// // // //             <Text style={styles.paymentOptionText}>PayPal</Text>
// // // //           </TouchableOpacity>
// // // //         </View>
// // // //       </View>

// // // //       {selectedPayment === 'credit-card' && (
// // // //  <View style={styles.card}>
// // // //           <Text style={styles.sectionTitle}>Card Details</Text>
// // // //           <TextInput
// // // //             style={styles.input}
// // // //             placeholder="Card Number"
// // // //             keyboardType="numeric"
// // // //             value={cardDetails.number}
// // // //             onChangeText={formatCardNumber}
// // // //           />
// // // //           <TextInput
// // // //             style={styles.input}
// // // //             placeholder="Cardholder Name"
// // // //             value={cardDetails.name}
// // // //             onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
// // // //           />
// // // //           <TextInput
// // // //             style={styles.input}
// // // //             placeholder="MM/YY"
// // // //             keyboardType="numeric"
// // // //             value={cardDetails.expiry}
// // // //             onChangeText={formatExpiry}
// // // //           />
// // // //           <TextInput
// // // //             style={styles.input}
// // // //             placeholder="CVV"
// // // //             keyboardType="numeric"
// // // //             secureTextEntry
// // // //             value={cardDetails.cvv}
// // // //             onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvv: text }))}
// // // //           />
// // // //         </View>
// // // //       )}

// // // //       <TouchableOpacity 
// // // //         style={[styles.button, isLoading && styles.buttonDisabled]} 
// // // //         onPress={handlePayment} 
// // // //         disabled={isLoading}
// // // //       >
// // // //         {isLoading ? (
// // // //           <ActivityIndicator color="#fff" />
// // // //         ) : (
// // // //           <Text style={styles.buttonText}>Pay Now</Text>
// // // //         )}
// // // //       </TouchableOpacity>
// // // //     </ScrollView>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     padding: 20,
// // // //     backgroundColor: '#fff'
// // // //   },
// // // //   header: {
// // // //     marginBottom: 20
// // // //   },
// // // //   headerTitle: {
// // // //     fontSize: 24,
// // // //     fontWeight: 'bold'
// // // //   },
// // // //   headerSubtitle: {
// // // //     fontSize: 16,
// // // //     color: '#666'
// // // //   },
// // // //   card: {
// // // //     marginBottom: 20,
// // // //     padding: 15,
// // // //     borderRadius: 10,
// // // //     backgroundColor: '#f8f8f8',
// // // //     elevation: 2
// // // //   },
// // // //   sectionTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     marginBottom: 10
// // // //   },
// // // //   summaryItem: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     paddingVertical: 5
// // // //   },
// // // //   summaryText: {
// // // //     fontSize: 16,
// // // //     color: '#333'
// // // //   },
// // // //   summaryValue: {
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold'
// // // //   },
// // // //   totalItem: {
// // // //     borderTopWidth: 1,
// // // //     borderTopColor: '#ddd',
// // // //     marginTop: 10,
// // // //     paddingTop: 10
// // // //   },
// // // //   totalText: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#333'
// // // //   },
// // // //   totalAmount: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: '#f00'
// // // //   },
// // // //   noItemsText: {
// // // //     textAlign: 'center',
// // // //     color: '#666'
// // // //   },
// // // //   paymentOptions: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-around'
// // // //   },
// // // //   paymentOption: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     backgroundColor: '#007bff',
// // // //     padding: 15,
// // // //     borderRadius: 5,
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     marginHorizontal: 5
// // // //   },
// // // //   creditCard: {
// // // //     backgroundColor: '#007bff'
// // // //   },
// // // //   paypal: {
// // // //     backgroundColor: '#ffcc00'
// // // //   },
// // // //   selectedPayment: {
// // // //     borderColor: '#fff',
// // // //     borderWidth: 2
// // // //   },
// // // //   paymentOptionText: {
// // // //     marginLeft: 10,
// // // //     color: '#fff',
// // // //     fontSize: 16
// // // //   },
// // // //   input: {
// // // //     borderWidth: 1,
// // // //     borderColor: '#ccc',
// // // //     borderRadius: 5,
// // // //     padding: 10,
// // // //     marginBottom: 15
// // // //   },
// // // //   button: {
// // // //     backgroundColor: '#28a745',
// // // //     borderRadius: 5,
// // // //     padding: 15,
// // // //     alignItems: 'center'
// // // //   },
// // // //   buttonText: {
// // // //     color: '#fff',
// // // //     fontSize: 18
// // // //   },
// // // //   buttonDisabled: {
// // // //     backgroundColor: '#ccc'
// // // //   },
// // // //   checklistItem: {
// // // //     marginVertical: 10
// // // //   },
// // // //   checklistHeader: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between'
// // // //   },
// // // //   checklistText: {
// // // //     fontSize: 16
// // // //   },
// // // //   checkedItem: {
// // // //     textDecorationLine: 'line-through',
// // // //     color: '#ccc'
// // // //   },
// // // //   priorityText: {
// // // //     fontSize: 14,
// // // //     marginTop: 5
// // // //   },
// // // //   prioritylow: {
// // // //     color: 'green'
// // // //   },
// // // //   prioritymedium: {
// // // //     color: 'orange'
// // // //   },
// // // //   priorityhigh: {
// // // //     color: 'red'
// // // //   }
// // // // });

// // // // export default Payment;

// // // // // // Payment.tsx
// // // // // import React from 'react';
// // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';
// // // // // import { useSelector } from 'react-redux';
// // // // // import { RootState } from '@/app/context/store'; // Adjust this import according to your store setup

// // // // // type Item = {
// // // // //   id: string;
// // // // //   name: string;
// // // // //   checked: boolean;
// // // // //   timestamp: Date;
// // // // //   priority: 'low' | 'medium' | 'high';
// // // // // };

// // // // // type PaymentProps = {
// // // // //   checklistItems?: Item[]; // Made optional with ?
// // // // // };

// // // // // const Payment: React.FC<PaymentProps> = ({ checklistItems = [] }) => {
// // // // //   // Fetch navigation data from Redux store, updating selectors to use nav properties
// // // // //   const origin = useSelector((state: RootState) => state.nav.origin);
// // // // //   const destination = useSelector((state: RootState) => state.nav.destination);
// // // // //   const vehicle = useSelector((state: RootState) => state.nav.vehicle);
// // // // //   const dateTime = useSelector((state: RootState) => state.nav.dateTime);
// // // // //   const distance = useSelector((state: RootState) => state.nav.distance);
// // // // //   const duration = useSelector((state: RootState) => state.nav.duration);

// // // // //   // Calculate total cost (vehicle price + fixed shipping cost)
// // // // //   const shippingCost = 10;
// // // // //   const vehiclePrice = vehicle?.price ? parseFloat(vehicle.price) : 0;
// // // // //   const totalCost = vehiclePrice + shippingCost;

// // // // //   return (
// // // // //     <ScrollView style={styles.container}>
// // // // //       <View style={styles.header}>
// // // // //         <Text style={styles.headerTitle}>Payment Details</Text>
// // // // //         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// // // // //       </View>

// // // // //       <View style={styles.card}>
// // // // //         <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>From:</Text>
// // // // //           <Text style={styles.summaryText}>{origin?.address || 'N/A'}</Text>
// // // // //         </View>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>To:</Text>
// // // // //           <Text style={styles.summaryText}>{destination?.address || 'N/A'}</Text>
// // // // //         </View>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>Distance:</Text>
// // // // //           <Text style={styles.summaryText}>{distance ? `${distance} miles` : 'N/A'}</Text>
// // // // //         </View>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>Vehicle:</Text>
// // // // //           <Text style={styles.summaryText}>{vehicle ? `${vehicle.type} - $${vehiclePrice}` : 'N/A'}</Text>
// // // // //         </View>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>Date & Time:</Text>
// // // // //           <Text style={styles.summaryText}>{dateTime ? `${dateTime.date} ${dateTime.time}` : 'N/A'}</Text>
// // // // //         </View>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>Shipping:</Text>
// // // // //           <Text style={styles.summaryText}>${shippingCost.toFixed(2)}</Text>
// // // // //         </View>
// // // // //         <View style={styles.summaryItem}>
// // // // //           <Text style={styles.summaryText}>Total:</Text>
// // // // //           <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
// // // // //         </View>
// // // // //       </View>

// // // // //       <View style={styles.card}>
// // // // //         <Text style={styles.sectionTitle}>Checklist Summary</Text>
// // // // //         {checklistItems && checklistItems.length > 0 ? (
// // // // //           checklistItems.map((item) => (
// // // // //             <View key={item.id} style={styles.checklistItem}>
// // // // //               <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// // // // //                 {item.name} {item.checked && '(Completed)'}
// // // // //               </Text>
// // // // //               <Text style={styles.priorityText}>Priority: {item.priority}</Text>
// // // // //             </View>
// // // // //           ))
// // // // //         ) : (
// // // // //           <Text style={styles.noItemsText}>No checklist items added</Text>
// // // // //         )}
// // // // //       </View>

// // // // //       <View style={styles.card}>
// // // // //         <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // //         <View style={styles.paymentOptions}>
// // // // //           <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
// // // // //             <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // //             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // // //           </TouchableOpacity>
// // // // //           <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
// // // // //             <MaterialIcons name="payment" size={24} color="#fff" />
// // // // //             <Text style={styles.paymentOptionText}>PayPal</Text>
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       </View>

// // // // //       <View style={styles.card}>
// // // // //         <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // //         <TextInput
// // // // //           style={styles.input}
// // // // //           placeholder="Card Number"
// // // // //           placeholderTextColor="#aaa"
// // // // //           keyboardType="numeric"
// // // // //         />
// // // // //         <TextInput
// // // // //           style={styles.input}
// // // // //           placeholder="Cardholder Name"
// // // // //           placeholderTextColor="#aaa"
// // // // //         />
// // // // //         <View style={styles.cardExpiry}>
// // // // //           <TextInput
// // // // //             style={[styles.input, styles.cardExpiryInput]}
// // // // //             placeholder="MM/YY"
// // // // //             placeholderTextColor="#aaa"
// // // // //             keyboardType="numeric"
// // // // //           />
// // // // //           <TextInput
// // // // //             style={[styles.input, styles.cardExpiryInput]}
// // // // //             placeholder="CVV"
// // // // //             placeholderTextColor="#aaa"
// // // // //             keyboardType="numeric"
// // // // //           />
// // // // //         </View>
// // // // //       </View>

// // // // //       <TouchableOpacity style={styles.payButton}>
// // // // //         <Text style={styles.payButtonText}>Pay Now</Text>
// // // // //         <AntDesign name="arrowright" size={20} color="#fff" />
// // // // //       </TouchableOpacity>
// // // // //     </ScrollView>
// // // // //   );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //   container: {
// // // // //     flex: 1,
// // // // //     backgroundColor: '#f8f9fa',
// // // // //     padding: 20,
// // // // //   },
// // // // //   header: {
// // // // //     marginBottom: 20,
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   headerTitle: {
// // // // //     fontSize: 28,
// // // // //     fontWeight: 'bold',
// // // // //     color: '#2d3436',
// // // // //     marginBottom: 5,
// // // // //   },
// // // // //   headerSubtitle: {
// // // // //     fontSize: 16,
// // // // //     color: '#636e72',
// // // // //   },
// // // // //   card: {
// // // // //     marginBottom: 20,
// // // // //     padding: 20,
// // // // //     backgroundColor: '#fff',
// // // // //     borderRadius: 12,
// // // // //     elevation: 2,
// // // // //   },
// // // // //   sectionTitle: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: 'bold',
// // // // //     marginBottom: 15,
// // // // //     color: '#2d3436',
// // // // //   },
// // // // //   summaryItem: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   summaryText: {
// // // // //     fontSize: 16,
// // // // //     color: '#636e72',
// // // // //   },
// // // // //   totalAmount: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: 'bold',
// // // // //     color: '#4a90e2',
// // // // //   },
// // // // //   checklistItem: {
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   checklistText: {
// // // // //     fontSize: 16,
// // // // //     color: '#2d3436',
// // // // //   },
// // // // //   checkedItem: {
// // // // //     textDecorationLine: 'line-through',
// // // // //     color: '#b2bec3',
// // // // //   },
// // // // //   priorityText: {
// // // // //     fontSize: 14,
// // // // //     color: '#636e72',
// // // // //     marginTop: 3,
// // // // //   },
// // // // //   noItemsText: {
// // // // //     fontSize: 16,
// // // // //     color: '#636e72',
// // // // //     fontStyle: 'italic',
// // // // //   },
// // // // //   paymentOptions: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //   },
// // // // //   paymentOption: {
// // // // //     flex: 1,
// // // // //     padding: 15,
// // // // //     borderRadius: 12,
// // // // //     marginHorizontal: 5,
// // // // //     alignItems: 'center',
// // // // //   },
// // // // //   creditCard: {
// // // // //     backgroundColor: '#4a90e2',
// // // // //   },
// // // // //   paypal: {
// // // // //     backgroundColor: '#ffc107',
// // // // //   },
// // // // //   paymentOptionText: {
// // // // //     color: '#fff',
// // // // //     marginTop: 5,
// // // // //     fontSize: 16,
// // // // //   },
// // // // //   input: {
// // // // //     height: 50,
// // // // //     borderColor: '#ddd',
// // // // //     borderWidth: 1,
// // // // //     borderRadius: 8,
// // // // //     paddingHorizontal: 15,
// // // // //     marginBottom: 15,
// // // // //     fontSize: 16,
// // // // //     backgroundColor: '#fff',
// // // // //   },
// // // // //   cardExpiry: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //   },
// // // // //   cardExpiryInput: {
// // // // //     flex: 1,
// // // // //     marginHorizontal: 5,
// // // // //   },
// // // // //   payButton: {
// // // // //     backgroundColor: '#4caf50',
// // // // //     padding: 16,
// // // // //     borderRadius: 12,
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'center',
// // // // //     flexDirection: 'row',
// // // // //   },
// // // // //   payButtonText: {
// // // // //     fontSize: 18,
// // // // //     color: '#fff',
// // // // //     fontWeight: 'bold',
// // // // //     marginRight: 10,
// // // // //   },
// // // // // });

// // // // // export default Payment;





// // // // // // import React from 'react';
// // // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

// // // // // // type Item = {
// // // // // //   id: string;
// // // // // //   name: string;
// // // // // //   checked: boolean;
// // // // // //   timestamp: Date;
// // // // // //   priority: 'low' | 'medium' | 'high';
// // // // // // };

// // // // // // type PaymentProps = {
// // // // // //   checklistItems?: Item[]; // Made optional with ?
// // // // // // };

// // // // // // const Payment: React.FC<PaymentProps> = ({ checklistItems = [] }) => { // Added default empty array
// // // // // //   // Sample data for demonstration
// // // // // //   const origin = "123 Main St, City A";
// // // // // //   const destination = "456 Elm St, City B";
// // // // // //   const distance = "15 miles";
// // // // // //   const vehicle = { type: "Sedan", price: 50 };
// // // // // //   const dateTime = "2024-11-10 10:00 AM";
// // // // // //   const shippingCost = 10;
// // // // // //   const totalCost = vehicle.price + shippingCost;

// // // // // //   return (
// // // // // //     <ScrollView style={styles.container}>
// // // // // //       <View style={styles.header}>
// // // // // //         <Text style={styles.headerTitle}>Payment Details</Text>
// // // // // //         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// // // // // //       </View>

// // // // // //       <View style={styles.card}>
// // // // // //         <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>From:</Text>
// // // // // //           <Text style={styles.summaryText}>{origin}</Text>
// // // // // //         </View>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>To:</Text>
// // // // // //           <Text style={styles.summaryText}>{destination}</Text>
// // // // // //         </View>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>Distance:</Text>
// // // // // //           <Text style={styles.summaryText}>{distance}</Text>
// // // // // //         </View>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>Vehicle:</Text>
// // // // // //           <Text style={styles.summaryText}>{vehicle.type} - ${vehicle.price}</Text>
// // // // // //         </View>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>Date & Time:</Text>
// // // // // //           <Text style={styles.summaryText}>{dateTime}</Text>
// // // // // //         </View>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>Shipping:</Text>
// // // // // //           <Text style={styles.summaryText}>${shippingCost.toFixed(2)}</Text>
// // // // // //         </View>
// // // // // //         <View style={styles.summaryItem}>
// // // // // //           <Text style={styles.summaryText}>Total:</Text>
// // // // // //           <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
// // // // // //         </View>
// // // // // //       </View>

// // // // // //       <View style={styles.card}>
// // // // // //         <Text style={styles.sectionTitle}>Checklist Summary</Text>
// // // // // //         {checklistItems && checklistItems.length > 0 ? ( // Added null check
// // // // // //           checklistItems.map((item) => (
// // // // // //             <View key={item.id} style={styles.checklistItem}>
// // // // // //               <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// // // // // //                 {item.name} {item.checked && '(Completed)'}
// // // // // //               </Text>
// // // // // //               <Text style={styles.priorityText}>Priority: {item.priority}</Text>
// // // // // //             </View>
// // // // // //           ))
// // // // // //         ) : (
// // // // // //           <Text style={styles.noItemsText}>No checklist items added</Text>
// // // // // //         )}
// // // // // //       </View>

// // // // // //       <View style={styles.card}>
// // // // // //         <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // // //         <View style={styles.paymentOptions}>
// // // // // //           <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
// // // // // //             <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // // //             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // // // //           </TouchableOpacity>
// // // // // //           <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
// // // // // //             <MaterialIcons name="payment" size={24} color="#fff" />
// // // // // //             <Text style={styles.paymentOptionText}>PayPal</Text>
// // // // // //           </TouchableOpacity>
// // // // // //         </View>
// // // // // //       </View>

// // // // // //       <View style={styles.card}>
// // // // // //         <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // // //         <TextInput
// // // // // //           style={styles.input}
// // // // // //           placeholder="Card Number"
// // // // // //           placeholderTextColor="#aaa"
// // // // // //           keyboardType="numeric"
// // // // // //         />
// // // // // //         <TextInput
// // // // // //           style={styles.input}
// // // // // //           placeholder="Cardholder Name"
// // // // // //           placeholderTextColor="#aaa"
// // // // // //         />
// // // // // //         <View style={styles.cardExpiry}>
// // // // // //           <TextInput
// // // // // //             style={[styles.input, styles.cardExpiryInput]}
// // // // // //             placeholder="MM/YY"
// // // // // //             placeholderTextColor="#aaa"
// // // // // //             keyboardType="numeric"
// // // // // //           />
// // // // // //           <TextInput
// // // // // //             style={[styles.input, styles.cardExpiryInput]}
// // // // // //             placeholder="CVV"
// // // // // //             placeholderTextColor="#aaa"
// // // // // //             keyboardType="numeric"
// // // // // //           />
// // // // // //         </View>
// // // // // //       </View>

// // // // // //       <TouchableOpacity style={styles.payButton}>
// // // // // //         <Text style={styles.payButtonText}>Pay Now</Text>
// // // // // //         <AntDesign name="arrowright" size={20} color="#fff" />
// // // // // //       </TouchableOpacity>
// // // // // //     </ScrollView>
// // // // // //   );
// // // // // // };

// // // // // // const styles = StyleSheet.create({
// // // // // //   container: {
// // // // // //     flex: 1,
// // // // // //     backgroundColor: '#f8f9fa',
// // // // // //     padding: 20,
// // // // // //   },
// // // // // //   header: {
// // // // // //     marginBottom: 20,
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   headerTitle: {
// // // // // //     fontSize: 28,
// // // // // //     fontWeight: 'bold',
// // // // // //     color: '#2d3436',
// // // // // //     marginBottom: 5,
// // // // // //   },
// // // // // //   headerSubtitle: {
// // // // // //     fontSize: 16,
// // // // // //     color: '#636e72',
// // // // // //   },
// // // // // //   card: {
// // // // // //     marginBottom: 20,
// // // // // //     padding: 20,
// // // // // //     backgroundColor: '#fff',
// // // // // //     borderRadius: 12,
// // // // // //     elevation: 2,
// // // // // //   },
// // // // // //   sectionTitle: {
// // // // // //     fontSize: 18,
// // // // // //     fontWeight: 'bold',
// // // // // //     marginBottom: 15,
// // // // // //     color: '#2d3436',
// // // // // //   },
// // // // // //   summaryItem: {
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'space-between',
// // // // // //     marginBottom: 10,
// // // // // //   },
// // // // // //   summaryText: {
// // // // // //     fontSize: 16,
// // // // // //     color: '#636e72',
// // // // // //   },
// // // // // //   totalAmount: {
// // // // // //     fontSize: 18,
// // // // // //     fontWeight: 'bold',
// // // // // //     color: '#4a90e2',
// // // // // //   },
// // // // // //   checklistItem: {
// // // // // //     marginBottom: 10,
// // // // // //   },
// // // // // //   checklistText: {
// // // // // //     fontSize: 16,
// // // // // //     color: '#2d3436',
// // // // // //   },
// // // // // //   checkedItem: {
// // // // // //     textDecorationLine: 'line-through',
// // // // // //     color: '#b2bec3',
// // // // // //   },
// // // // // //   priorityText: {
// // // // // //     fontSize: 14,
// // // // // //     color: '#636e72',
// // // // // //     marginTop: 3,
// // // // // //   },
// // // // // //   noItemsText: {
// // // // // //     fontSize: 16,
// // // // // //     color: '#636e72',
// // // // // //     fontStyle: 'italic',
// // // // // //   },
// // // // // //   paymentOptions: {
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'space-between',
// // // // // //   },
// // // // // //   paymentOption: {
// // // // // //     flex: 1,
// // // // // //     padding: 15,
// // // // // //     borderRadius: 12,
// // // // // //     marginHorizontal: 5,
// // // // // //     alignItems: 'center',
// // // // // //   },
// // // // // //   creditCard: {
// // // // // //     backgroundColor: '#4a90e2',
// // // // // //   },
// // // // // //   paypal: {
// // // // // //     backgroundColor: '#ffc107',
// // // // // //   },
// // // // // //   paymentOptionText: {
// // // // // //     color: '#fff',
// // // // // //     marginTop: 5,
// // // // // //     fontSize: 16,
// // // // // //   },
// // // // // //   input: {
// // // // // //     height: 50,
// // // // // //     borderColor: '#ddd',
// // // // // //     borderWidth: 1,
// // // // // //     borderRadius: 8,
// // // // // //     paddingHorizontal: 15,
// // // // // //     marginBottom: 15,
// // // // // //     fontSize: 16,
// // // // // //     backgroundColor: '#fff',
// // // // // //   },
// // // // // //   cardExpiry: {
// // // // // //     flexDirection: 'row',
// // // // // //     justifyContent: 'space-between',
// // // // // //   },
// // // // // //   cardExpiryInput: {
// // // // // //     flex: 1,
// // // // // //     marginHorizontal: 5,
// // // // // //   },
// // // // // //   payButton: {
// // // // // //     backgroundColor: '#4caf50',
// // // // // //     padding: 16,
// // // // // //     borderRadius: 12,
// // // // // //     alignItems: 'center',
// // // // // //     justifyContent: 'center',
// // // // // //     flexDirection: 'row',
// // // // // //   },
// // // // // //   payButtonText: {
// // // // // //     fontSize: 18,
// // // // // //     color: '#fff',
// // // // // //     fontWeight: 'bold',
// // // // // //     marginRight: 10,
// // // // // //   },
// // // // // // });

// // // // // // export default Payment;



// // // // // // // import React from 'react';
// // // // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

// // // // // // // type Item = {
// // // // // // //   id: string;
// // // // // // //   name: string;
// // // // // // //   checked: boolean;
// // // // // // //   timestamp: Date;
// // // // // // //   priority: 'low' | 'medium' | 'high';
// // // // // // // };

// // // // // // // type PaymentProps = {
// // // // // // //   checklistItems: Item[];
// // // // // // // };

// // // // // // // const Payment: React.FC<PaymentProps> = ({ checklistItems }) => {
// // // // // // //   // Sample data for demonstration
// // // // // // //   const origin = "123 Main St, City A";
// // // // // // //   const destination = "456 Elm St, City B";
// // // // // // //   const distance = "15 miles";
// // // // // // //   const vehicle = { type: "Sedan", price: 50 };
// // // // // // //   const dateTime = "2024-11-10 10:00 AM";
// // // // // // //   const shippingCost = 10;
// // // // // // //   const totalCost = vehicle.price + shippingCost;

// // // // // // //   return (
// // // // // // //     <ScrollView style={styles.container}>
// // // // // // //       <View style={styles.header}>
// // // // // // //         <Text style={styles.headerTitle}>Payment Details</Text>
// // // // // // //         <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// // // // // // //       </View>

// // // // // // //       <View style={styles.card}>
// // // // // // //         <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>From:</Text>
// // // // // // //           <Text style={styles.summaryText}>{origin}</Text>
// // // // // // //         </View>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>To:</Text>
// // // // // // //           <Text style={styles.summaryText}>{destination}</Text>
// // // // // // //         </View>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>Distance:</Text>
// // // // // // //           <Text style={styles.summaryText}>{distance}</Text>
// // // // // // //         </View>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>Vehicle:</Text>
// // // // // // //           <Text style={styles.summaryText}>{vehicle.type} - ${vehicle.price}</Text>
// // // // // // //         </View>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>Date & Time:</Text>
// // // // // // //           <Text style={styles.summaryText}>{dateTime}</Text>
// // // // // // //         </View>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>Shipping:</Text>
// // // // // // //           <Text style={styles.summaryText}>${shippingCost.toFixed(2)}</Text>
// // // // // // //         </View>
// // // // // // //         <View style={styles.summaryItem}>
// // // // // // //           <Text style={styles.summaryText}>Total:</Text>
// // // // // // //           <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
// // // // // // //         </View>
// // // // // // //       </View>

// // // // // // //       <View style={styles.card}>
// // // // // // //         <Text style={styles.sectionTitle}>Checklist Summary</Text>
// // // // // // //         {checklistItems.length > 0 ? (
// // // // // // //           checklistItems.map((item) => (
// // // // // // //             <View key={item.id} style={styles.checklistItem}>
// // // // // // //               <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// // // // // // //                 {item.name} {item.checked && '(Completed)'}
// // // // // // //               </Text>
// // // // // // //               <Text style={styles.priorityText}>Priority: {item.priority}</Text>
// // // // // // //             </View>
// // // // // // //           ))
// // // // // // //         ) : (
// // // // // // //           <Text style={styles.noItemsText}>No checklist items added</Text>
// // // // // // //         )}
// // // // // // //       </View>

// // // // // // //       <View style={styles.card}>
// // // // // // //         <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // // // //         <View style={styles.paymentOptions}>
// // // // // // //           <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
// // // // // // //             <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // // // //             <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // // // // //           </TouchableOpacity>
// // // // // // //           <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
// // // // // // //             <MaterialIcons name="payment" size={24} color="#fff" />
// // // // // // //             <Text style={styles.paymentOptionText}>PayPal</Text>
// // // // // // //           </TouchableOpacity>
// // // // // // //         </View>
// // // // // // //       </View>

// // // // // // //       <View style={styles.card}>
// // // // // // //         <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // // // //         <TextInput
// // // // // // //           style={styles.input}
// // // // // // //           placeholder="Card Number"
// // // // // // //           placeholderTextColor="#aaa"
// // // // // // //           keyboardType="numeric"
// // // // // // //         />
// // // // // // //         <TextInput
// // // // // // //           style={styles.input}
// // // // // // //           placeholder="Cardholder Name"
// // // // // // //           placeholderTextColor="#aaa"
// // // // // // //         />
// // // // // // //         <View style={styles.cardExpiry}>
// // // // // // //           <TextInput
// // // // // // //             style={[styles.input, styles.cardExpiryInput]}
// // // // // // //             placeholder="MM/YY"
// // // // // // //             placeholderTextColor="#aaa"
// // // // // // //             keyboardType="numeric"
// // // // // // //           />
// // // // // // //           <TextInput
// // // // // // //             style={[styles.input, styles.cardExpiryInput]}
// // // // // // //             placeholder="CVV"
// // // // // // //             placeholderTextColor="#aaa"
// // // // // // //             keyboardType="numeric"
// // // // // // //           />
// // // // // // //         </View>
// // // // // // //       </View>

// // // // // // //       <TouchableOpacity style={styles.payButton}>
// // // // // // //         <Text style={styles.payButtonText}>Pay Now</Text>
// // // // // // //         <AntDesign name="arrowright" size={20} color="#fff" />
// // // // // // //       </TouchableOpacity>
// // // // // // //     </ScrollView>
// // // // // // //   );
// // // // // // // };

// // // // // // // const styles = StyleSheet.create({
// // // // // // //   container: {
// // // // // // //     flex: 1,
// // // // // // //     backgroundColor: '#f8f9fa',
// // // // // // //     padding: 20,
// // // // // // //   },
// // // // // // //   header: {
// // // // // // //     marginBottom: 20,
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   headerTitle: {
// // // // // // //     fontSize: 28,
// // // // // // //     fontWeight: 'bold',
// // // // // // //     color: '#2d3436',
// // // // // // //     marginBottom: 5,
// // // // // // //   },
// // // // // // //   headerSubtitle: {
// // // // // // //     fontSize: 16,
// // // // // // //     color: '#636e72',
// // // // // // //   },
// // // // // // //   card: {
// // // // // // //     marginBottom: 20,
// // // // // // //     padding: 20,
// // // // // // //     backgroundColor: '#fff',
// // // // // // //     borderRadius: 12,
// // // // // // //     elevation: 2,
// // // // // // //   },
// // // // // // //   sectionTitle: {
// // // // // // //     fontSize: 18,
// // // // // // //     fontWeight: 'bold',
// // // // // // //     marginBottom: 15,
// // // // // // //     color: '#2d3436',
// // // // // // //   },
// // // // // // //   summaryItem: {
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'space-between',
// // // // // // //     marginBottom: 10,
// // // // // // //   },
// // // // // // //   summaryText: {
// // // // // // //     fontSize: 16,
// // // // // // //     color: '#636e72',
// // // // // // //   },
// // // // // // //   totalAmount: {
// // // // // // //     fontSize: 18,
// // // // // // //     fontWeight: 'bold',
// // // // // // //     color: '#4a90e2',
// // // // // // //   },
// // // // // // //   checklistItem: {
// // // // // // //     marginBottom: 10,
// // // // // // //   },
// // // // // // //   checklistText: {
// // // // // // //     fontSize: 16,
// // // // // // //     color: '#2d3436',
// // // // // // //   },
// // // // // // //   checkedItem: {
// // // // // // //     textDecorationLine: 'line-through',
// // // // // // //     color: '#b2bec3',
// // // // // // //   },
// // // // // // //   priorityText: {
// // // // // // //     fontSize: 14,
// // // // // // //     color: '#636e72',
// // // // // // //     marginTop: 3,
// // // // // // //   },
// // // // // // //   noItemsText: {
// // // // // // //     fontSize: 16,
// // // // // // //     color: '#636e72',
// // // // // // //     fontStyle: 'italic',
// // // // // // //   },
// // // // // // //   paymentOptions: {
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'space-between',
// // // // // // //   },
// // // // // // //   paymentOption: {
// // // // // // //     flex: 1,
// // // // // // //     padding: 15,
// // // // // // //     borderRadius: 12,
// // // // // // //     marginHorizontal: 5,
// // // // // // //     alignItems: 'center',
// // // // // // //   },
// // // // // // //   creditCard: {
// // // // // // //     backgroundColor: '#4a90e2',
// // // // // // //   },
// // // // // // //   paypal: {
// // // // // // //     backgroundColor: '#ffc107',
// // // // // // //   },
// // // // // // //   paymentOptionText: {
// // // // // // //     color: '#fff',
// // // // // // //     marginTop: 5,
// // // // // // //     fontSize: 16,
// // // // // // //   },
// // // // // // //   input: {
// // // // // // //     height: 50,
// // // // // // //     borderColor: '#ddd',
// // // // // // //     borderWidth: 1,
// // // // // // //     borderRadius: 8,
// // // // // // //     paddingHorizontal: 15,
// // // // // // //     marginBottom: 15,
// // // // // // //     fontSize: 16,
// // // // // // //     backgroundColor: '#fff',
// // // // // // //   },
// // // // // // //   cardExpiry: {
// // // // // // //     flexDirection: 'row',
// // // // // // //     justifyContent: 'space-between',
// // // // // // //   },
// // // // // // //   cardExpiryInput: {
// // // // // // //     flex: 1,
// // // // // // //     marginHorizontal: 5,
// // // // // // //   },
// // // // // // //   payButton: {
// // // // // // //     backgroundColor: '#4caf50',
// // // // // // //     padding: 16,
// // // // // // //     borderRadius: 12,
// // // // // // //     alignItems: 'center',
// // // // // // //     justifyContent: 'center',
// // // // // // //     flexDirection: 'row',
// // // // // // //   },
// // // // // // //   payButtonText: {
// // // // // // //     fontSize: 18,
// // // // // // //     color: '#fff',
// // // // // // //     fontWeight: 'bold',
// // // // // // //     marginRight: 10,
// // // // // // //   },
// // // // // // // });

// // // // // // // export default Payment;


// // // // // // // // import React from 'react';
// // // // // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

// // // // // // // // type Item = {
// // // // // // // //     id: string;
// // // // // // // //     name: string;
// // // // // // // //     checked: boolean;
// // // // // // // //     timestamp: Date;
// // // // // // // //     priority: 'low' | 'medium' | 'high';
// // // // // // // // };

// // // // // // // // type PaymentProps = {
// // // // // // // //     checklistItems: Item[];
// // // // // // // // };

// // // // // // // // const Payment: React.FC<PaymentProps> = ({ checklistItems }) => {
// // // // // // // //     // Sample data for demonstration
// // // // // // // //     const origin = "123 Main St, City A";
// // // // // // // //     const destination = "456 Elm St, City B";
// // // // // // // //     const distance = "15 miles";
// // // // // // // //     const vehicle = { type: "Sedan", price: 50 };
// // // // // // // //     const dateTime = "2024-11-10 10:00 AM";
// // // // // // // //     const shippingCost = 10;
// // // // // // // //     const totalCost = vehicle.price + shippingCost;

// // // // // // // //     return (
// // // // // // // //         <ScrollView style={styles.container}>
// // // // // // // //             <View style={styles.header}>
// // // // // // // //                 <Text style={styles.headerTitle}>Payment Details</Text>
// // // // // // // //                 <Text style={styles.headerSubtitle}>Review your order before proceeding</Text>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.card}>
// // // // // // // //                 <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>From:</Text>
// // // // // // // //                     <Text style={styles.summaryText}>{origin}</Text>
// // // // // // // //                 </View>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>To:</Text>
// // // // // // // //                     <Text style={styles.summaryText}>{destination}</Text>
// // // // // // // //                 </View>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>Distance:</Text>
// // // // // // // //                     <Text style={styles.summaryText}>{distance}</Text>
// // // // // // // //                 </View>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>Vehicle:</Text>
// // // // // // // //                     <Text style={styles.summaryText}>{vehicle.type} - ${vehicle.price}</Text>
// // // // // // // //                 </View>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>Date & Time:</Text>
// // // // // // // //                     <Text style={styles.summaryText}>{dateTime}</Text>
// // // // // // // //                 </View>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>Shipping:</Text>
// // // // // // // //                     <Text style={styles.summaryText}>${shippingCost.toFixed(2)}</Text>
// // // // // // // //                 </View>
// // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // //                     <Text style={styles.summaryText}>Total:</Text>
// // // // // // // //                     <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
// // // // // // // //                 </View>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.card}>
// // // // // // // //                 <Text style={styles.sectionTitle}>Checklist Summary</Text>
// // // // // // // //                 {checklistItems.length > 0 ? (
// // // // // // // //                     checklistItems.map((item) => (
// // // // // // // //                         <View key={item.id} style={styles.checklistItem}>
// // // // // // // //                             <Text style={[styles.checklistText, item.checked && styles.checkedItem]}>
// // // // // // // //                                 {item.name} {item.checked && '(Completed)'}
// // // // // // // //                             </Text>
// // // // // // // //                             <Text style={styles.priorityText}>Priority: {item.priority}</Text>
// // // // // // // //                         </View>
// // // // // // // //                     ))
// // // // // // // //                 ) : (
// // // // // // // //                     <Text style={styles.noItemsText}>No checklist items added</Text>
// // // // // // // //                 )}
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.card}>
// // // // // // // //                 <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // // // // //                 <View style={styles.paymentOptions}>
// // // // // // // //                     <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
// // // // // // // //                         <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // // // // //                         <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // // // // // //                     </TouchableOpacity>
// // // // // // // //                     <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
// // // // // // // //                         <MaterialIcons name="payment" size={24} color="#fff" />
// // // // // // // //                         <Text style={styles.paymentOptionText}>PayPal</Text>
// // // // // // // //                     </TouchableOpacity>
// // // // // // // //                 </View>
// // // // // // // //             </View>

// // // // // // // //             <View style={styles.card}>
// // // // // // // //                 <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // // // // //                 <TextInput
// // // // // // // //                     style={styles.input}
// // // // // // // //                     placeholder="Card Number"
// // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // //                     keyboardType="numeric"
// // // // // // // //                 />
// // // // // // // //                 <TextInput
// // // // // // // //                     style={styles.input}
// // // // // // // //                     placeholder="Cardholder Name"
// // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // //                 />
// // // // // // // //                 <View style={styles.cardExpiry}>
// // // // // // // //                     <TextInput
// // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // //                         placeholder="MM/YY"
// // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // //                         keyboardType="numeric"
// // // // // // // //                     />
// // // // // // // //                     <TextInput
// // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // //                         placeholder="CVV"
// // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // //                         keyboardType="numeric"
// // // // // // // //                     />
// // // // // // // //                 </View>
// // // // // // // //             </View>

// // // // // // // //             <TouchableOpacity style={styles.payButton}>
// // // // // // // //                 <Text style={styles.payButtonText}>Pay Now</Text>
// // // // // // // //                 <AntDesign name="arrowright" size={20} color="#fff" />
// // // // // // // //             </TouchableOpacity>
// // // // // // // //         </ScrollView>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //     container: {
// // // // // // // //         flex: 1,
// // // // // // // //         backgroundColor: '#f8f9fa',
// // // // // // // //         padding: 20,
// // // // // // // //     },
// // // // // // // //     header: {
// // // // // // // //         marginBottom: 20,
// // // // // // // //         alignItems: 'center',
// // // // // // // //     },
// // // // // // // //     headerTitle: {
// // // // // // // //         fontSize: 28,
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //         color: '#2d3436',
// // // // // // // //         marginBottom: 5,
// // // // // // // //     },
// // // // // // // //     headerSubtitle: {
// // // // // // // //         fontSize: 16,
// // // // // // // //         color: '#636e72',
// // // // // // // //     },
// // // // // // // //     card: {
// // // // // // // //         marginBottom: 20,
// // // // // // // //         padding: 20,
// // // // // // // //         backgroundColor: '#fff',
// // // // // // // //         borderRadius: 12,
// // // // // // // //         elevation: 2,
// // // // // // // //     },
// // // // // // // //     sectionTitle: {
// // // // // // // //         fontSize: 18,
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //         marginBottom: 15,
// // // // // // // //         color: '#2d3436',
// // // // // // // //     },
// // // // // // // //     summaryItem: {
// // // // // // // //         flexDirection: 'row',
// // // // // // // //         justifyContent: 'space-between',
// // // // // // // //         marginBottom: 10,
// // // // // // // //     },
// // // // // // // //     summaryText: {
// // // // // // // //         fontSize: 16,
// // // // // // // //         color: '#636e72',
// // // // // // // //     },
// // // // // // // //     totalAmount: {
// // // // // // // //         fontSize: 18,
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //         color: '#4a90e2',
// // // // // // // //     },
// // // // // // // //     checklistItem: {
// // // // // // // //         marginBottom: 10,
// // // // // // // //     },
// // // // // // // //     checklistText: {
// // // // // // // //         fontSize: 16,
// // // // // // // //         color: '#2d3436',
// // // // // // // //     },
// // // // // // // //     checkedItem: {
// // // // // // // //         textDecorationLine: 'line-through',
// // // // // // // //         color: '#b2bec3',
// // // // // // // //     },
// // // // // // // //     priorityText: {
// // // // // // // //         fontSize: 14,
// // // // // // // //         color: '#636e72',
// // // // // // // //         marginTop: 3,
// // // // // // // //     },
// // // // // // // //     noItemsText: {
// // // // // // // //         fontSize: 16,
// // // // // // // //         color: '#636e72',
// // // // // // // //         fontStyle: 'italic',
// // // // // // // //     },
// // // // // // // //     paymentOptions: {
// // // // // // // //         flexDirection: 'row',
// // // // // // // //         justifyContent: 'space-between',
// // // // // // // //     },
// // // // // // // //     paymentOption: {
// // // // // // // //         flex: 1,
// // // // // // // //         padding: 15,
// // // // // // // //         borderRadius: 12,
// // // // // // // //         marginHorizontal: 5,
// // // // // // // //         alignItems: 'center',
// // // // // // // //     },
// // // // // // // //     creditCard: {
// // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // //     },
// // // // // // // //     paypal: {
// // // // // // // //         backgroundColor: '#ffc107',
// // // // // // // //     },
// // // // // // // //     paymentOptionText: {
// // // // // // // //         color: '#fff',
// // // // // // // //         marginTop: 5,
// // // // // // // //         fontSize: 16,
// // // // // // // //     },
// // // // // // // //     input: {
// // // // // // // //         height: 50,
// // // // // // // //         borderColor: '#ddd',
// // // // // // // //         borderWidth: 1,
// // // // // // // //         borderRadius: 8,
// // // // // // // //         paddingHorizontal: 15,
// // // // // // // //         marginBottom: 15,
// // // // // // // //         fontSize: 16,
// // // // // // // //         backgroundColor: '#fff',
// // // // // // // //     },
// // // // // // // //     cardExpiry: {
// // // // // // // //         flexDirection: 'row',
// // // // // // // //         justifyContent: 'space-between',
// // // // // // // //     },
// // // // // // // //     cardExpiryInput: {
// // // // // // // //         flex: 1,
// // // // // // // //         marginHorizontal: 5,
// // // // // // // //     },
// // // // // // // //     payButton: {
// // // // // // // //         backgroundColor: '#4caf50',
// // // // // // // //         padding: 16,
// // // // // // // //         borderRadius: 12,
// // // // // // // //         alignItems: 'center',
// // // // // // // //         justifyContent: 'center',
// // // // // // // //         flexDirection: 'row',
// // // // // // // //     },
// // // // // // // //     payButtonText: {
// // // // // // // //         fontSize: 18,
// // // // // // // //         color: '#fff',
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //         marginRight: 10,
// // // // // // // //     },
// // // // // // // // });

// // // // // // // // export default Payment;



// // // // // // // // // import React from 'react';
// // // // // // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // // // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

// // // // // // // // // const Payment: React.FC = () => {
// // // // // // // // //     // Sample data for demonstration
// // // // // // // // //     const origin = "123 Main St, City A";
// // // // // // // // //     const destination = "456 Elm St, City B";
// // // // // // // // //     const distance = "15 miles";
// // // // // // // // //     const vehicle = { type: "Sedan", price: 50 };
// // // // // // // // //     const dateTime = "2024-11-10 10:00 AM";
// // // // // // // // //     const items = ["Item 1", "Item 2"];
// // // // // // // // //     const shippingCost = 10;
// // // // // // // // //     const totalCost = vehicle.price + shippingCost;

// // // // // // // // //     return (
// // // // // // // // //         <ScrollView style={styles.container}>
// // // // // // // // //             <View style={styles.header}>
// // // // // // // // //                 <Text style={styles.headerTitle}>Payment Details</Text>
// // // // // // // // //                 <Text style={styles.headerSubtitle}>Complete your order by entering your payment information</Text>
// // // // // // // // //             </View>

// // // // // // // // //             <View style={styles.card}>
// // // // // // // // //                 <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>From:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>{origin}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>To:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>{destination}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Distance:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>{distance}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Vehicle:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>{vehicle.type} - ${vehicle.price}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Date & Time:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>{dateTime}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Items:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>{items.join(', ')}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Item Total:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>${vehicle.price.toFixed(2)}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Shipping:</Text>
// // // // // // // // //                     <Text style={styles.summaryText}>${shippingCost.toFixed(2)}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // //                     <Text style={styles.summaryText}>Total:</Text>
// // // // // // // // //                     <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
// // // // // // // // //                 </View>
// // // // // // // // //             </View>

// // // // // // // // //             <View style={styles.card}>
// // // // // // // // //                 <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // // // // // //                 <View style={styles.paymentOptions}>
// // // // // // // // //                     <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
// // // // // // // // //                         <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // // // // // //                         <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // // // // // // //                     </TouchableOpacity>
// // // // // // // // //                     <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
// // // // // // // // //                         <MaterialIcons name="payment" size={24} color="#fff" />
// // // // // // // // //                         <Text style={styles.paymentOptionText}>PayPal</Text>
// // // // // // // // //                     </TouchableOpacity>
// // // // // // // // //                 </View>
// // // // // // // // //             </View>

// // // // // // // // //             <View style={styles.card}>
// // // // // // // // //                 <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // // // // // //                 <TextInput
// // // // // // // // //                     style={styles.input}
// // // // // // // // //                     placeholder="Card Number"
// // // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // // //                     keyboardType="numeric"
// // // // // // // // //                 />
// // // // // // // // //                 <TextInput
// // // // // // // // //                     style={styles.input}
// // // // // // // // //                     placeholder="Cardholder Name"
// // // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // // //                 />
// // // // // // // // //                 <View style={styles.cardExpiry}>
// // // // // // // // //                     <TextInput
// // // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // // //                         placeholder="MM/YY"
// // // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // // //                         keyboardType="numeric"
// // // // // // // // //                     />
// // // // // // // // //                     <TextInput
// // // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // // //                         placeholder="CVV"
// // // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // // //                         keyboardType="numeric"
// // // // // // // // //                     />
// // // // // // // // //                 </View>
// // // // // // // // //             </View>

// // // // // // // // //             <TouchableOpacity style={styles.payButton}>
// // // // // // // // //  <Text style={styles.payButtonText}>Pay Now</Text>
// // // // // // // // //                 <AntDesign name="arrowright" size={20} color="#fff" />
// // // // // // // // //             </TouchableOpacity>
// // // // // // // // //         </ScrollView>
// // // // // // // // //     );
// // // // // // // // // };

// // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // //     container: {
// // // // // // // // //         flex: 1,
// // // // // // // // //         backgroundColor: '#f8f9fa',
// // // // // // // // //         padding: 20,
// // // // // // // // //     },
// // // // // // // // //     header: {
// // // // // // // // //         marginBottom: 20,
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //     },
// // // // // // // // //     headerTitle: {
// // // // // // // // //         fontSize: 28,
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //         color: '#2d3436',
// // // // // // // // //         marginBottom: 5,
// // // // // // // // //     },
// // // // // // // // //     headerSubtitle: {
// // // // // // // // //         fontSize: 16,
// // // // // // // // //         color: '#636e72',
// // // // // // // // //     },
// // // // // // // // //     card: {
// // // // // // // // //         marginBottom: 20,
// // // // // // // // //         padding: 20,
// // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // //         borderRadius: 12,
// // // // // // // // //         elevation: 2,
// // // // // // // // //         shadowColor: '#000',
// // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // //         shadowRadius: 4,
// // // // // // // // //     },
// // // // // // // // //     sectionTitle: {
// // // // // // // // //         fontSize: 18,
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //         marginBottom: 15,
// // // // // // // // //         color: '#2d3436',
// // // // // // // // //     },
// // // // // // // // //     paymentOptions: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // //     },
// // // // // // // // //     paymentOption: {
// // // // // // // // //         flex: 1,
// // // // // // // // //         padding: 15,
// // // // // // // // //         borderRadius: 12,
// // // // // // // // //         marginHorizontal: 5,
// // // // // // // // //         justifyContent: 'center',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         elevation: 2,
// // // // // // // // //         shadowColor: '#000',
// // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // //         shadowRadius: 4,
// // // // // // // // //     },
// // // // // // // // //     creditCard: {
// // // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // // //     },
// // // // // // // // //     paypal: {
// // // // // // // // //         backgroundColor: '#ffc107',
// // // // // // // // //     },
// // // // // // // // //     paymentOptionText: {
// // // // // // // // //         color: '#fff',
// // // // // // // // //         marginTop: 5,
// // // // // // // // //         fontSize: 16,
// // // // // // // // //         fontWeight: '600',
// // // // // // // // //     },
// // // // // // // // //     input: {
// // // // // // // // //         height: 50,
// // // // // // // // //         borderColor: '#ddd',
// // // // // // // // //         borderWidth: 1,
// // // // // // // // //         borderRadius: 8,
// // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // //         marginBottom: 15,
// // // // // // // // //         fontSize: 16,
// // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // //         elevation: 1,
// // // // // // // // //         shadowColor: '#000',
// // // // // // // // //         shadowOffset: { width: 0, height: 1 },
// // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // //         shadowRadius: 2,
// // // // // // // // //     },
// // // // // // // // //     cardExpiry: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // //     },
// // // // // // // // //     cardExpiryInput: {
// // // // // // // // //         flex: 1,
// // // // // // // // //         marginHorizontal: 5,
// // // // // // // // //     },
// // // // // // // // //     summaryItem: {
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // //         marginBottom: 10,
// // // // // // // // //     },
// // // // // // // // //     summaryText: {
// // // // // // // // //         fontSize: 16,
// // // // // // // // //         color: '#636e72',
// // // // // // // // //     },
// // // // // // // // //     totalAmount: {
// // // // // // // // //         fontSize: 18,
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //         color: '#4a90e2',
// // // // // // // // //     },
// // // // // // // // //     payButton: {
// // // // // // // // //         backgroundColor: '#4caf50',
// // // // // // // // //         padding: 16,
// // // // // // // // //         borderRadius: 12,
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         justifyContent: 'center',
// // // // // // // // //         flexDirection: 'row',
// // // // // // // // //         elevation: 4,
// // // // // // // // //         shadowColor: '#000',
// // // // // // // // //         shadowOffset: { width: 0, height: 4 },
// // // // // // // // //         shadowOpacity: 0.2,
// // // // // // // // //         shadowRadius: 5,
// // // // // // // // //     },
// // // // // // // // //     payButtonText: {
// // // // // // // // //         fontSize: 18,
// // // // // // // // //         color: '#fff',
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //         marginRight: 10,
// // // // // // // // //     },
// // // // // // // // // });

// // // // // // // // // export default Payment;





// // // // // // // // // // import React from 'react';
// // // // // // // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // // // // // // import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

// // // // // // // // // // const Payment: React.FC = () => {
// // // // // // // // // //     return (
// // // // // // // // // //         <ScrollView style={styles.container}>
// // // // // // // // // //             <View style={styles.header}>
// // // // // // // // // //                 <Text style={styles.headerTitle}>Payment Details</Text>
// // // // // // // // // //                 <Text style={styles.headerSubtitle}>Complete your order by entering your payment information</Text>
// // // // // // // // // //             </View>

// // // // // // // // // //             <View style={styles.card}>
// // // // // // // // // //                 <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // // // // // // //                 <View style={styles.paymentOptions}>
// // // // // // // // // //                     <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
// // // // // // // // // //                         <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // // // // // // //                         <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
// // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // //                     <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
// // // // // // // // // //                         <MaterialIcons name="payment" size={24} color="#fff" />
// // // // // // // // // //                         <Text style={styles.paymentOptionText}>PayPal</Text>
// // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // //                 </View>
// // // // // // // // // //             </View>

// // // // // // // // // //             <View style={styles.card}>
// // // // // // // // // //                 <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // // // // // // //                 <TextInput
// // // // // // // // // //                     style={styles.input}
// // // // // // // // // //                     placeholder="Card Number"
// // // // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // // // //                     keyboardType="numeric"
// // // // // // // // // //                 />
// // // // // // // // // //                 <TextInput
// // // // // // // // // //                     style={styles.input}
// // // // // // // // // //                     placeholder="Cardholder Name"
// // // // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // // // //                 />
// // // // // // // // // //                 <View style={styles.cardExpiry}>
// // // // // // // // // //                     <TextInput
// // // // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // // // //                         placeholder="MM/YY"
// // // // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // // // //                         keyboardType="numeric"
// // // // // // // // // //                     />
// // // // // // // // // //                     <TextInput
// // // // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // // // //                         placeholder="CVV"
// // // // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // // // //                         keyboardType="numeric"
// // // // // // // // // //                     />
// // // // // // // // // //                 </View>
// // // // // // // // // //             </View>

// // // // // // // // // //             <View style={styles.card}>
// // // // // // // // // //                 <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // // //                     <Text style={styles.summaryText}>Item Total</Text>
// // // // // // // // // //                     <Text style={styles.summaryText}>$100.00</Text>
// // // // // // // // // //                 </View>
// // // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // // //                     <Text style={styles.summaryText}>Shipping</Text>
// // // // // // // // // //                     <Text style={styles.summaryText}>$10.00</Text>
// // // // // // // // // //                 </View>
// // // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // // //                     <Text style={styles.summaryText}>Total</Text>
// // // // // // // // // //                     <Text style={styles.totalAmount}>$110.00</Text>
// // // // // // // // // //                 </View>
// // // // // // // // // //             </View>

// // // // // // // // // //             <TouchableOpacity style={styles.payButton}>
// // // // // // // // // //                 <Text style={styles.payButtonText}>Pay Now</Text>
// // // // // // // // // //                 <AntDesign name="arrowright" size={20} color="#fff" />
// // // // // // // // // //             </TouchableOpacity>
// // // // // // // // // //         </ScrollView>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // //     container: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         backgroundColor: '#f8f9fa',
// // // // // // // // // //         padding: 20,
// // // // // // // // // //     },
// // // // // // // // // //     header: {
// // // // // // // // // //         marginBottom: 20,
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //     },
// // // // // // // // // //     headerTitle: {
// // // // // // // // // //         fontSize: 28,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         color: '#2d3436',
// // // // // // // // // //         marginBottom: 5,
// // // // // // // // // //     },
// // // // // // // // // //     headerSubtitle: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         color: '#636e72',
// // // // // // // // // //     },
// // // // // // // // // //     card: {
// // // // // // // // // //         marginBottom: 20,
// // // // // // // // // //         padding: 20,
// // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // //         borderRadius: 12,
// // // // // // // // // //         elevation: 2,
// // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // //         shadowRadius: 4,
// // // // // // // // // //     },
// // // // // // // // // //     sectionTitle: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         marginBottom: 15,
// // // // // // // // // //         color: '#2d3436',
// // // // // // // // // //     },
// // // // // // // // // //     paymentOptions: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // //     },
// // // // // // // // // //     paymentOption: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         padding: 15,
// // // // // // // // // //         borderRadius: 12,
// // // // // // // // // //         marginHorizontal: 5,
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         elevation: 2,
// // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // //         shadowRadius: 4,
// // // // // // // // // //     },
// // // // // // // // // //     creditCard: {
// // // // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // // // //     },
// // // // // // // // // //     paypal: {
// // // // // // // // // //         backgroundColor: '#ffc107',
// // // // // // // // // //     },
// // // // // // // // // //     paymentOptionText: {
// // // // // // // // // //         color: '#fff',
// // // // // // // // // //         marginTop: 5,
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         fontWeight: '600',
// // // // // // // // // //     },
// // // // // // // // // //     input: {
// // // // // // // // // //         height: 50,
// // // // // // // // // //         borderColor: '#ddd',
// // // // // // // // // //         borderWidth: 1,
// // // // // // // // // //         borderRadius: 8,
// // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // //         marginBottom: 15,
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // //         elevation: 1,
// // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // //         shadowOffset: { width: 0, height: 1 },
// // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // //         shadowRadius: 2,
// // // // // // // // // //     },
// // // // // // // // // //     cardExpiry: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // //     },
// // // // // // // // // //     cardExpiryInput: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         marginHorizontal: 5,
// // // // // // // // // //     },
// // // // // // // // // //     summaryItem: {
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //     },
// // // // // // // // // //     summaryText: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         color: '#636e72',
// // // // // // // // // //     },
// // // // // // // // // //     totalAmount: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         color: '#4a90e2',
// // // // // // // // // //     },
// // // // // // // // // //     payButton: {
// // // // // // // // // //         backgroundColor: '#4caf50',
// // // // // // // // // //         padding: 16,
// // // // // // // // // //         borderRadius: 12,
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // //         elevation: 4,
// // // // // // // // // //         shadowColor: '#000',
// // // // // // // // // //         shadowOffset: { width: 0, height: 4 },
// // // // // // // // // //         shadowOpacity: 0.2,
// // // // // // // // // //         shadowRadius: 5,
// // // // // // // // // //     },
// // // // // // // // // //     payButtonText: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         color: '#fff',
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //         marginRight: 10,
// // // // // // // // // //     },
// // // // // // // // // // });

// // // // // // // // // // export default Payment;



// // // // // // // // // // // import React from 'react';
// // // // // // // // // // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // // // // // // // // // // import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// // // // // // // // // // // const Payment: React.FC = () => {
// // // // // // // // // // //     return (
// // // // // // // // // // //         <ScrollView style={styles.container}>
// // // // // // // // // // //             <View style={styles.header}>
// // // // // // // // // // //                 <Text style={styles.headerText}>Payment Details</Text>
// // // // // // // // // // //             </View>
// // // // // // // // // // //             <View style={styles.cardContainer}>
// // // // // // // // // // //                 <Text style={styles.sectionTitle}>Payment Method</Text>
// // // // // // // // // // //                 <View style={styles.cardOptions}>
// // // // // // // // // // //                     <TouchableOpacity style={styles.cardOption}>
// // // // // // // // // // //                         <FontAwesome5 name="credit-card" size={24} color="#fff" />
// // // // // // // // // // //                         <Text style={styles.cardText}>Credit/Debit Card</Text>
// // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // //                     <TouchableOpacity style={styles.cardOption}>
// // // // // // // // // // //                         <MaterialIcons name="payment" size={24} color="#fff" />
// // // // // // // // // // //                         <Text style={styles.cardText}>PayPal</Text>
// // // // // // // // // // //                     </TouchableOpacity>
// // // // // // // // // // //                 </View>
// // // // // // // // // // //             </View>
// // // // // // // // // // //             <View style={styles.paymentDetails}>
// // // // // // // // // // //                 <Text style={styles.sectionTitle}>Enter Card Details</Text>
// // // // // // // // // // //                 <TextInput
// // // // // // // // // // //                     style={styles.input}
// // // // // // // // // // //                     placeholder="Card Number"
// // // // // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // // // // //                     keyboardType="numeric"
// // // // // // // // // // //                 />
// // // // // // // // // // //                 <TextInput
// // // // // // // // // // //                     style={styles.input}
// // // // // // // // // // //                     placeholder="Cardholder Name"
// // // // // // // // // // //                     placeholderTextColor="#aaa"
// // // // // // // // // // //                 />
// // // // // // // // // // //                 <View style={styles.cardExpiry}>
// // // // // // // // // // //                     <TextInput
// // // // // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // // // // //                         placeholder="MM/YY"
// // // // // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // // // // //                         keyboardType="numeric"
// // // // // // // // // // //                     />
// // // // // // // // // // //                     <TextInput
// // // // // // // // // // //                         style={[styles.input, styles.cardExpiryInput]}
// // // // // // // // // // //                         placeholder="CVV"
// // // // // // // // // // //                         placeholderTextColor="#aaa"
// // // // // // // // // // //                         keyboardType="numeric"
// // // // // // // // // // //                     />
// // // // // // // // // // //                 </View>
// // // // // // // // // // //             </View>
// // // // // // // // // // //             <View style={styles.summary}>
// // // // // // // // // // //                 <Text style={styles.sectionTitle}>Order Summary</Text>
// // // // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // // // //                     <Text style={styles.summaryText}>Item Total</Text>
// // // // // // // // // // //                     <Text style={styles.summaryText}>$100.00</Text>
// // // // // // // // // // //                 </View>
// // // // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // // // //                     <Text style={styles.summaryText}>Shipping</Text>
// // // // // // // // // // //                     <Text style={styles.summaryText}>$10.00</Text>
// // // // // // // // // // //                 </View>
// // // // // // // // // // //                 <View style={styles.summaryItem}>
// // // // // // // // // // //                     <Text style={styles.summaryText}>Total</Text>
// // // // // // // // // // //                     <Text style={styles.totalAmount}>$110.00</Text>
// // // // // // // // // // //                 </View>
// // // // // // // // // // //             </View>
// // // // // // // // // // //             <TouchableOpacity style={styles.payButton}>
// // // // // // // // // // //                 <Text style={styles.payButtonText}>Pay Now</Text>
// // // // // // // // // // //             </TouchableOpacity>
// // // // // // // // // // //         </ScrollView>
// // // // // // // // // // //     );
// // // // // // // // // // // };

// // // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // // //     container: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         backgroundColor: '#f9f9f9',
// // // // // // // // // // //         padding: 20,
// // // // // // // // // // //     },
// // // // // // // // // // //     header: {
// // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // //         paddingVertical: 10,
// // // // // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //     },
// // // // // // // // // // //     headerText: {
// // // // // // // // // // //         fontSize: 22,
// // // // // // // // // // //         color: '#fff',
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //     },
// // // // // // // // // // //     cardContainer: {
// // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // //         padding: 15,
// // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // //         elevation: 3,
// // // // // // // // // // //     },
// // // // // // // // // // //     sectionTitle: {
// // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //         color: '#333',
// // // // // // // // // // //     },
// // // // // // // // // // //     cardOptions: {
// // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // //     },
// // // // // // // // // // //     cardOption: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         padding: 15,
// // // // // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // //         marginHorizontal: 5,
// // // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         elevation: 2,
// // // // // // // // // // //     },
// // // // // // // // // // //     cardText: {
// // // // // // // // // // //         color: '#fff',
// // // // // // // // // // //         marginTop: 5,
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //     },
// // // // // // // // // // //     paymentDetails: {
// // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // //         padding: 15,
// // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // //         elevation: 3,
// // // // // // // // // // //     },
// // // // // // // // // // //     input: {
// // // // // // // // // // //         height: 50,
// // // // // // // // // // //         borderColor: '#ddd',
// // // // // // // // // // //         borderWidth: 1,
// // // // // // // // // // //         borderRadius: 8,
// // // // // // // // // // //         paddingHorizontal: 15,
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // //     },
// // // // // // // // // // //     cardExpiry: {
// // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // //     },
// // // // // // // // // // //     cardExpiryInput: {
// // // // // // // // // // //         flex: 1,
// // // // // // // // // // //         marginHorizontal: 5,
// // // // // // // // // // //     },
// // // // // // // // // // //     summary: {
// // // // // // // // // // //         marginBottom: 20,
// // // // // // // // // // //         padding: 15,
// // // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // // //         borderRadius: 10,
// // // // // // // // // // //         elevation: 3,
// // // // // // // // // // //     },
// // // // // // // // // // //     summaryItem: {
// // // // // // // // // // //         flexDirection: 'row',
// // // // // // // // // // //         justifyContent: 'space-between',
// // // // // // // // // // //         marginBottom: 10,
// // // // // // // // // // //     },
// // // // // // // // // // //     summaryText: {
// // // // // // // // // // //         fontSize: 16,
// // // // // // // // // // //         color: '#333',
// // // // // // // // // // //     },
// // // // // // // // // // //     totalAmount: {
// // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //         color: '#4a90e2',
// // // // // // // // // // //     },
// // // // // // // // // // //     payButton: {
// // // // // // // // // // //         backgroundColor: '#4caf50',
// // // // // // // // // // //         padding: 15,
// // // // // // // // // // //         borderRadius: 30,
// // // // // // // // // // //         alignItems: 'center',
// // // // // // // // // // //         elevation: 5,
// // // // // // // // // // //     },
// // // // // // // // // // //     payButtonText: {
// // // // // // // // // // //         fontSize: 18,
// // // // // // // // // // //         color: '#fff',
// // // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // // //     },
// // // // // // // // // // // });

// // // // // // // // // // // export default Payment;
