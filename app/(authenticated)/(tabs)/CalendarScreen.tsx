import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type TimeSlot = {
    time: string;
    selected: boolean;
};

const availableTimeSlots: TimeSlot[] = [
    { time: '9:00 AM - 10:00 AM', selected: false },
    { time: '10:00 AM - 11:00 AM', selected: false },
    { time: '11:00 AM - 12:00 PM', selected: false },
    { time: '12:00 PM - 1:00 PM', selected: false },
    { time: '1:00 PM - 2:00 PM', selected: false },
    { time: '2:00 PM - 3:00 PM', selected: false },
    { time: '3:00 PM - 4:00 PM', selected: false },
    { time: '4:00 PM - 5:00 PM', selected: false },
    { time: '5:00 PM - 6:00 PM', selected: false },
];

const MyCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);
    // const navigation = useNavigation();
    const router = useRouter();

    const handleDatePress = (date: DateObject) => {
        setSelectedDate(date);
        setTimeSlots(availableTimeSlots);
    };

    const handleTimeSlotPress = (index: number) => {
        const updatedTimeSlots = [...timeSlots];
        updatedTimeSlots[index].selected = !updatedTimeSlots[index].selected;
        setTimeSlots(updatedTimeSlots);
    };

    const handleContinuePress = () => {
        if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
            Alert.alert('Error', 'Please select both a date and a time slot.');
            return;
        }
        router.push('CheckList')
    };

    return (
        <SafeAreaView style={styles.container}>
            <Calendar
                style={styles.calendar}
                onDayPress={handleDatePress}
                markingType={'custom'}
                markedDates={selectedDate ? {
                    [selectedDate.dateString]: {
                        customStyles: {
                            container: {
                                backgroundColor: '#ff6f61', // Highlight color
                                borderRadius: 15,
                            },
                            text: {
                                color: '#fff',
                            },
                        },
                    },
                } : {}}
            />
            {selectedDate && (
                <View style={styles.timeSlotsContainer}>
                    <Text style={styles.timeSlotsTitle}>Select Time Slots for {selectedDate.dateString}</Text>
                    <FlatList
                        data={timeSlots}
                        keyExtractor={(item) => item.time}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={[
                                    styles.timeSlot,
                                    item.selected && styles.timeSlotSelected,
                                ]}
                                onPress={() => handleTimeSlotPress(index)}
                            >
                                <Text
                                    style={[
                                        styles.timeSlotText,
                                        item.selected && styles.timeSlotTextSelected,
                                    ]}
                                >
                                    {item.time}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
            <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
                <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        height: 60,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10,
    },
    headerText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    calendar: {
        margin: 10,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#fff',
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    timeSlotsContainer: {
        flex: 1,
        padding: 15,
    },
    timeSlotsTitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    timeSlot: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    timeSlotSelected: {
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
    },
    timeSlotText: {
        fontSize: 16,
        color: '#333',
    },
    timeSlotTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    continueButton: {
        backgroundColor: '#ff6f61',
        padding: 15,
        borderRadius: 30,
        margin: 15,
        alignItems: 'center',
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    continueButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default MyCalendar;


// import React, { useState } from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// import { Calendar, DateObject } from 'react-native-calendars';
// import { ScrollView } from 'react-native-gesture-handler';

// type TimeSlot = {
//     time: string;
//     selected: boolean;
// };

// const availableTimeSlots: TimeSlot[] = [
//     { time: '9:00 AM - 10:00 AM', selected: false },
//     { time: '10:00 AM - 11:00 AM', selected: false },
//     { time: '11:00 AM - 12:00 PM', selected: false },
//     { time: '12:00 PM - 1:00 PM', selected: false },
//     { time: '1:00 PM - 2:00 PM', selected: false },
//     { time: '2:00 PM - 3:00 PM', selected: false },
//     { time: '3:00 PM - 4:00 PM', selected: false },
//     { time: '4:00 PM - 5:00 PM', selected: false },
//     { time: '5:00 PM - 6:00 PM', selected: false },
// ];

// const MyCalendar: React.FC = () => {
//     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
//     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);

//     const handleDatePress = (date: DateObject) => {
//         setSelectedDate(date);
//         setTimeSlots(availableTimeSlots);
//     };

//     const handleTimeSlotPress = (index: number) => {
//         const updatedTimeSlots = [...timeSlots];
//         updatedTimeSlots[index].selected = !updatedTimeSlots[index].selected;
//         setTimeSlots(updatedTimeSlots);
//     };

//     return (
//         <ScrollView style={styles.container}>
//             <Calendar
//                 style={styles.calendar}
//                 onDayPress={handleDatePress}
//                 markingType={'custom'}
//                 markedDates={selectedDate ? {
//                     [selectedDate.dateString]: {
//                         customStyles: {
//                             container: {
//                                 backgroundColor: '#ff6f61', // Highlight color
//                                 borderRadius: 15,
//                             },
//                             text: {
//                                 color: '#fff',
//                             },
//                         },
//                     },
//                 } : {}}
//             />
//             {selectedDate && (
//                 <View style={styles.timeSlotsContainer}>
//                     <Text style={styles.timeSlotsTitle}>Select Time Slots for {selectedDate.dateString}</Text>
//                     <FlatList
//                         data={timeSlots}
//                         keyExtractor={(item) => item.time}
//                         renderItem={({ item, index }) => (
//                             <TouchableOpacity
//                                 style={[
//                                     styles.timeSlot,
//                                     item.selected && styles.timeSlotSelected,
//                                 ]}
//                                 onPress={() => handleTimeSlotPress(index)}
//                             >
//                                 <Text
//                                     style={[
//                                         styles.timeSlotText,
//                                         item.selected && styles.timeSlotTextSelected,
//                                     ]}
//                                 >
//                                     {item.time}
//                                 </Text>
//                             </TouchableOpacity>
//                         )}
//                     />
//                 </View>
//             )}
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f0f4f8',
//     },
//     header: {
//         height: 60,
//         backgroundColor: '#4a90e2',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderBottomLeftRadius: 30,
//         borderBottomRightRadius: 30,
//         marginBottom: 10,
//     },
//     headerText: {
//         fontSize: 22,
//         color: '#fff',
//         fontWeight: 'bold',
//     },
//     calendar: {
//         margin: 10,
//         borderRadius: 15,
//         overflow: 'hidden',
//         backgroundColor: '#fff',
//         elevation: 5, // Shadow for Android
//         shadowColor: '#000', // Shadow for iOS
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 5,
//     },
//     timeSlotsContainer: {
//         flex: 1,
//         padding: 15,
//     },
//     timeSlotsTitle: {
//         fontSize: 18,
//         color: '#333',
//         marginBottom: 10,
//         fontWeight: 'bold',
//     },
//     timeSlot: {
//         padding: 15,
//         marginBottom: 10,
//         borderRadius: 10,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         backgroundColor: '#fff',
//     },
//     timeSlotSelected: {
//         backgroundColor: '#4caf50',
//         borderColor: '#4caf50',
//     },
//     timeSlotText: {
//         fontSize: 16,
//         color: '#333',
//     },
//     timeSlotTextSelected: {
//         color: '#fff',
//         fontWeight: 'bold',
//     },
// });

// export default MyCalendar;



// import React, { useState } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { Calendar, DateObject } from 'react-native-calendars';

// type TimeSlot = {
//     time: string;
// };

// const MyCalendar: React.FC = () => {
//     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
//     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

//     const handleDatePress = (date: DateObject) => {
//         setSelectedDate(date);
//         // Fetch time slots for the selected date from your backend or logic here
//         setTimeSlots([
//             { time: '9:00 AM - 10:00 AM' },
//             { time: '10:00 AM - 11:00 AM' },
//         ]);
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.headerText}>Select Date</Text>
//             </View>
//             <Calendar onDayPress={handleDatePress} />
//             {selectedDate && (
//                 <View style={styles.timeSlotsContainer}>
//                     <Text style={styles.timeSlotsTitle}>Time Slots for {selectedDate.dateString}</Text>
//                     <FlatList
//                         data={timeSlots}
//                         keyExtractor={(item) => item.time}
//                         renderItem={({ item }) => <Text style={styles.timeSlot}>{item.time}</Text>}
//                     />
//                 </View>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     header: {
//         height: 100,
//         backgroundColor: '#f5f5',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerText: {
//         fontSize: 20,
//         padding: 10,
//     },
//     timeSlotsContainer: {
//         padding: 10,
//     },
//     timeSlotsTitle: {
//         fontSize: 16,
//         marginBottom: 10,
//     },
//     timeSlot: {
//         fontSize: 14,
//     },
// });

// export default MyCalendar;
