import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

const Payment: React.FC = () => {
    // Sample data for demonstration
    const origin = "123 Main St, City A";
    const destination = "456 Elm St, City B";
    const distance = "15 miles";
    const vehicle = { type: "Sedan", price: 50 };
    const dateTime = "2024-11-10 10:00 AM";
    const items = ["Item 1", "Item 2"];
    const shippingCost = 10;
    const totalCost = vehicle.price + shippingCost;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payment Details</Text>
                <Text style={styles.headerSubtitle}>Complete your order by entering your payment information</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>From:</Text>
                    <Text style={styles.summaryText}>{origin}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>To:</Text>
                    <Text style={styles.summaryText}>{destination}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Distance:</Text>
                    <Text style={styles.summaryText}>{distance}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Vehicle:</Text>
                    <Text style={styles.summaryText}>{vehicle.type} - ${vehicle.price}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Date & Time:</Text>
                    <Text style={styles.summaryText}>{dateTime}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Items:</Text>
                    <Text style={styles.summaryText}>{items.join(', ')}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Item Total:</Text>
                    <Text style={styles.summaryText}>${vehicle.price.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Shipping:</Text>
                    <Text style={styles.summaryText}>${shippingCost.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Total:</Text>
                    <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentOptions}>
                    <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
                        <FontAwesome5 name="credit-card" size={24} color="#fff" />
                        <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
                        <MaterialIcons name="payment" size={24} color="#fff" />
                        <Text style={styles.paymentOptionText}>PayPal</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Enter Card Details</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Card Number"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Cardholder Name"
                    placeholderTextColor="#aaa"
                />
                <View style={styles.cardExpiry}>
                    <TextInput
                        style={[styles.input, styles.cardExpiryInput]}
                        placeholder="MM/YY"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={[styles.input, styles.cardExpiryInput]}
                        placeholder="CVV"
                        placeholderTextColor="#aaa"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.payButton}>
 <Text style={styles.payButtonText}>Pay Now</Text>
                <AntDesign name="arrowright" size={20} color="#fff" />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#636e72',
    },
    card: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2d3436',
    },
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentOption: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    creditCard: {
        backgroundColor: '#4a90e2',
    },
    paypal: {
        backgroundColor: '#ffc107',
    },
    paymentOptionText: {
        color: '#fff',
        marginTop: 5,
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardExpiry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardExpiryInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
        color: '#636e72',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a90e2',
    },
    payButton: {
        backgroundColor: '#4caf50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    payButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 10,
    },
});

export default Payment;





// import React from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// import { FontAwesome5, MaterialIcons, AntDesign } from '@expo/vector-icons';

// const Payment: React.FC = () => {
//     return (
//         <ScrollView style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Payment Details</Text>
//                 <Text style={styles.headerSubtitle}>Complete your order by entering your payment information</Text>
//             </View>

//             <View style={styles.card}>
//                 <Text style={styles.sectionTitle}>Payment Method</Text>
//                 <View style={styles.paymentOptions}>
//                     <TouchableOpacity style={[styles.paymentOption, styles.creditCard]}>
//                         <FontAwesome5 name="credit-card" size={24} color="#fff" />
//                         <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={[styles.paymentOption, styles.paypal]}>
//                         <MaterialIcons name="payment" size={24} color="#fff" />
//                         <Text style={styles.paymentOptionText}>PayPal</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             <View style={styles.card}>
//                 <Text style={styles.sectionTitle}>Enter Card Details</Text>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Card Number"
//                     placeholderTextColor="#aaa"
//                     keyboardType="numeric"
//                 />
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Cardholder Name"
//                     placeholderTextColor="#aaa"
//                 />
//                 <View style={styles.cardExpiry}>
//                     <TextInput
//                         style={[styles.input, styles.cardExpiryInput]}
//                         placeholder="MM/YY"
//                         placeholderTextColor="#aaa"
//                         keyboardType="numeric"
//                     />
//                     <TextInput
//                         style={[styles.input, styles.cardExpiryInput]}
//                         placeholder="CVV"
//                         placeholderTextColor="#aaa"
//                         keyboardType="numeric"
//                     />
//                 </View>
//             </View>

//             <View style={styles.card}>
//                 <Text style={styles.sectionTitle}>Order Summary</Text>
//                 <View style={styles.summaryItem}>
//                     <Text style={styles.summaryText}>Item Total</Text>
//                     <Text style={styles.summaryText}>$100.00</Text>
//                 </View>
//                 <View style={styles.summaryItem}>
//                     <Text style={styles.summaryText}>Shipping</Text>
//                     <Text style={styles.summaryText}>$10.00</Text>
//                 </View>
//                 <View style={styles.summaryItem}>
//                     <Text style={styles.summaryText}>Total</Text>
//                     <Text style={styles.totalAmount}>$110.00</Text>
//                 </View>
//             </View>

//             <TouchableOpacity style={styles.payButton}>
//                 <Text style={styles.payButtonText}>Pay Now</Text>
//                 <AntDesign name="arrowright" size={20} color="#fff" />
//             </TouchableOpacity>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8f9fa',
//         padding: 20,
//     },
//     header: {
//         marginBottom: 20,
//         alignItems: 'center',
//     },
//     headerTitle: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: '#2d3436',
//         marginBottom: 5,
//     },
//     headerSubtitle: {
//         fontSize: 16,
//         color: '#636e72',
//     },
//     card: {
//         marginBottom: 20,
//         padding: 20,
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 15,
//         color: '#2d3436',
//     },
//     paymentOptions: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     paymentOption: {
//         flex: 1,
//         padding: 15,
//         borderRadius: 12,
//         marginHorizontal: 5,
//         justifyContent: 'center',
//         alignItems: 'center',
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     creditCard: {
//         backgroundColor: '#4a90e2',
//     },
//     paypal: {
//         backgroundColor: '#ffc107',
//     },
//     paymentOptionText: {
//         color: '#fff',
//         marginTop: 5,
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     input: {
//         height: 50,
//         borderColor: '#ddd',
//         borderWidth: 1,
//         borderRadius: 8,
//         paddingHorizontal: 15,
//         marginBottom: 15,
//         fontSize: 16,
//         backgroundColor: '#fff',
//         elevation: 1,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//     },
//     cardExpiry: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     cardExpiryInput: {
//         flex: 1,
//         marginHorizontal: 5,
//     },
//     summaryItem: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 10,
//     },
//     summaryText: {
//         fontSize: 16,
//         color: '#636e72',
//     },
//     totalAmount: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#4a90e2',
//     },
//     payButton: {
//         backgroundColor: '#4caf50',
//         padding: 16,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//         flexDirection: 'row',
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//     },
//     payButtonText: {
//         fontSize: 18,
//         color: '#fff',
//         fontWeight: 'bold',
//         marginRight: 10,
//     },
// });

// export default Payment;



// // import React from 'react';
// // import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// // import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// // const Payment: React.FC = () => {
// //     return (
// //         <ScrollView style={styles.container}>
// //             <View style={styles.header}>
// //                 <Text style={styles.headerText}>Payment Details</Text>
// //             </View>
// //             <View style={styles.cardContainer}>
// //                 <Text style={styles.sectionTitle}>Payment Method</Text>
// //                 <View style={styles.cardOptions}>
// //                     <TouchableOpacity style={styles.cardOption}>
// //                         <FontAwesome5 name="credit-card" size={24} color="#fff" />
// //                         <Text style={styles.cardText}>Credit/Debit Card</Text>
// //                     </TouchableOpacity>
// //                     <TouchableOpacity style={styles.cardOption}>
// //                         <MaterialIcons name="payment" size={24} color="#fff" />
// //                         <Text style={styles.cardText}>PayPal</Text>
// //                     </TouchableOpacity>
// //                 </View>
// //             </View>
// //             <View style={styles.paymentDetails}>
// //                 <Text style={styles.sectionTitle}>Enter Card Details</Text>
// //                 <TextInput
// //                     style={styles.input}
// //                     placeholder="Card Number"
// //                     placeholderTextColor="#aaa"
// //                     keyboardType="numeric"
// //                 />
// //                 <TextInput
// //                     style={styles.input}
// //                     placeholder="Cardholder Name"
// //                     placeholderTextColor="#aaa"
// //                 />
// //                 <View style={styles.cardExpiry}>
// //                     <TextInput
// //                         style={[styles.input, styles.cardExpiryInput]}
// //                         placeholder="MM/YY"
// //                         placeholderTextColor="#aaa"
// //                         keyboardType="numeric"
// //                     />
// //                     <TextInput
// //                         style={[styles.input, styles.cardExpiryInput]}
// //                         placeholder="CVV"
// //                         placeholderTextColor="#aaa"
// //                         keyboardType="numeric"
// //                     />
// //                 </View>
// //             </View>
// //             <View style={styles.summary}>
// //                 <Text style={styles.sectionTitle}>Order Summary</Text>
// //                 <View style={styles.summaryItem}>
// //                     <Text style={styles.summaryText}>Item Total</Text>
// //                     <Text style={styles.summaryText}>$100.00</Text>
// //                 </View>
// //                 <View style={styles.summaryItem}>
// //                     <Text style={styles.summaryText}>Shipping</Text>
// //                     <Text style={styles.summaryText}>$10.00</Text>
// //                 </View>
// //                 <View style={styles.summaryItem}>
// //                     <Text style={styles.summaryText}>Total</Text>
// //                     <Text style={styles.totalAmount}>$110.00</Text>
// //                 </View>
// //             </View>
// //             <TouchableOpacity style={styles.payButton}>
// //                 <Text style={styles.payButtonText}>Pay Now</Text>
// //             </TouchableOpacity>
// //         </ScrollView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#f9f9f9',
// //         padding: 20,
// //     },
// //     header: {
// //         marginBottom: 20,
// //         paddingVertical: 10,
// //         backgroundColor: '#4a90e2',
// //         borderRadius: 10,
// //         alignItems: 'center',
// //     },
// //     headerText: {
// //         fontSize: 22,
// //         color: '#fff',
// //         fontWeight: 'bold',
// //     },
// //     cardContainer: {
// //         marginBottom: 20,
// //         padding: 15,
// //         backgroundColor: '#fff',
// //         borderRadius: 10,
// //         elevation: 3,
// //     },
// //     sectionTitle: {
// //         fontSize: 18,
// //         fontWeight: 'bold',
// //         marginBottom: 10,
// //         color: '#333',
// //     },
// //     cardOptions: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //     },
// //     cardOption: {
// //         flex: 1,
// //         padding: 15,
// //         backgroundColor: '#4a90e2',
// //         borderRadius: 10,
// //         marginHorizontal: 5,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         elevation: 2,
// //     },
// //     cardText: {
// //         color: '#fff',
// //         marginTop: 5,
// //         fontSize: 16,
// //     },
// //     paymentDetails: {
// //         marginBottom: 20,
// //         padding: 15,
// //         backgroundColor: '#fff',
// //         borderRadius: 10,
// //         elevation: 3,
// //     },
// //     input: {
// //         height: 50,
// //         borderColor: '#ddd',
// //         borderWidth: 1,
// //         borderRadius: 8,
// //         paddingHorizontal: 15,
// //         marginBottom: 10,
// //         fontSize: 16,
// //         backgroundColor: '#fff',
// //     },
// //     cardExpiry: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //     },
// //     cardExpiryInput: {
// //         flex: 1,
// //         marginHorizontal: 5,
// //     },
// //     summary: {
// //         marginBottom: 20,
// //         padding: 15,
// //         backgroundColor: '#fff',
// //         borderRadius: 10,
// //         elevation: 3,
// //     },
// //     summaryItem: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         marginBottom: 10,
// //     },
// //     summaryText: {
// //         fontSize: 16,
// //         color: '#333',
// //     },
// //     totalAmount: {
// //         fontSize: 18,
// //         fontWeight: 'bold',
// //         color: '#4a90e2',
// //     },
// //     payButton: {
// //         backgroundColor: '#4caf50',
// //         padding: 15,
// //         borderRadius: 30,
// //         alignItems: 'center',
// //         elevation: 5,
// //     },
// //     payButtonText: {
// //         fontSize: 18,
// //         color: '#fff',
// //         fontWeight: 'bold',
// //     },
// // });

// // export default Payment;
