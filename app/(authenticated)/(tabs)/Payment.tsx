import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const Payment: React.FC = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Payment Details</Text>
            </View>
            <View style={styles.cardContainer}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.cardOptions}>
                    <TouchableOpacity style={styles.cardOption}>
                        <FontAwesome5 name="credit-card" size={24} color="#fff" />
                        <Text style={styles.cardText}>Credit/Debit Card</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cardOption}>
                        <MaterialIcons name="payment" size={24} color="#fff" />
                        <Text style={styles.cardText}>PayPal</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.paymentDetails}>
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
            <View style={styles.summary}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Item Total</Text>
                    <Text style={styles.summaryText}>$100.00</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Shipping</Text>
                    <Text style={styles.summaryText}>$10.00</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryText}>Total</Text>
                    <Text style={styles.totalAmount}>$110.00</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.payButton}>
                <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 20,
    },
    header: {
        marginBottom: 20,
        paddingVertical: 10,
        backgroundColor: '#4a90e2',
        borderRadius: 10,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    cardContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    cardOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardOption: {
        flex: 1,
        padding: 15,
        backgroundColor: '#4a90e2',
        borderRadius: 10,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    cardText: {
        color: '#fff',
        marginTop: 5,
        fontSize: 16,
    },
    paymentDetails: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    cardExpiry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardExpiryInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    summary: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryText: {
        fontSize: 16,
        color: '#333',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a90e2',
    },
    payButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
    },
    payButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Payment;
