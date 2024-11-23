import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ImageBackground,
    ActivityIndicator,
    Animated,
    SectionList,
    Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import backgroundImage from '@/assets/images/bg_IMG_1.jpeg';
import { useDispatch } from 'react-redux';
import { setDateTime } from '@/app/context/slices/navSlice';

const { width } = Dimensions.get('window');

type TimeSlot = {
    time: string;
    selected: boolean;
};

const availableTimeSlots: TimeSlot[] = [
    { time: '9:00 AM - 10:00 AM', selected: false },
    { time: '10:00 AM - 11:00 AM', selected: false },
    { time: '1:00 PM - 2:00 PM', selected: false },
    { time: '3:00 PM - 4:00 PM', selected: false },
];

type DateObject = {
    day: number;
    month: number;
    year: number;
    dateString: string;
    timestamp: number;
};

const MyCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
    const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
    const [isLoading, setIsLoading] = useState(true);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(50))[0];
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start(() => setIsLoading(false));
    }, []);

    const handleDatePress = (date: DateObject) => {
        setSelectedDate(date);
        setTimeSlots(availableTimeSlots);
    };

    const handleTimeSlotPress = (index: number) => {
        const updatedTimeSlots = timeSlots.map((slot, idx) => ({
            ...slot,
            selected: idx === index ? !slot.selected : false,
        }));
        setTimeSlots(updatedTimeSlots);
    };

    const handleContinuePress = () => {
        const selectedTimeSlot = timeSlots.find(slot => slot.selected);
        
        if (!selectedDate || !selectedTimeSlot) {
            Alert.alert('Incomplete Selection', 'Please select both a date and time slot.');
            return;
        }

        // Dispatch selected date and time slot to Redux
        dispatch(setDateTime({ date: selectedDate.dateString, time: selectedTimeSlot.time }));

        // Navigate to the next page
        router.push('/(authenticated)/(tabs)/Checklist/Checklist');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00cc6a" />
            </View>
        );
    }

    return (
        <ImageBackground 
            source={backgroundImage} 
            resizeMode="cover" 
            style={styles.backgroundImage}
        >
            <StatusBar style="light" />
            <SafeAreaView style={styles.container}>
                <Animated.View 
                    style={[
                        styles.content, 
                        { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <SectionList
                        sections={[
                            { title: 'Select Your Preferred Date', data: ['calendar'] },
                            { title: 'Choose Available Time Slot', data: timeSlots },
                        ]}
                        keyExtractor={(item, index) => 
                            typeof item === 'string' ? item : item.time || index.toString()
                        }
                        contentContainerStyle={styles.listContainer}
                        renderItem={({ item, index, section }) => {
                            if (section.title.includes('Date')) {
                                return (
                                    <BlurView intensity={40} tint="dark" style={styles.calendarContainer}>
                                        <Calendar
                                            style={styles.calendar}
                                            onDayPress={handleDatePress}
                                            minDate={new Date().toISOString().split('T')[0]}
                                            markedDates={
                                                selectedDate
                                                    ? {
                                                          [selectedDate.dateString]: {
                                                              selected: true,
                                                              selectedColor: '#00cc6a',
                                                          },
                                                      }
                                                    : {}
                                            }
                                        />
                                    </BlurView>
                                );
                            } else if (typeof item !== 'string') {
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.timeSlot,
                                            item.selected && styles.timeSlotSelected,
                                        ]}
                                        onPress={() => handleTimeSlotPress(index)}
                                    >
                                        <BlurView intensity={40} tint="dark" style={styles.timeSlotBlur}>
                                            <Text style={[
                                                styles.timeSlotText,
                                                item.selected && styles.timeSlotTextSelected,
                                            ]}>
                                                {item.time}
                                            </Text>
                                        </BlurView>
                                    </TouchableOpacity>
                                );
                            }
                            return null;
                        }}
                        renderSectionHeader={({ section: { title } }) => (
                            <Text style={styles.sectionHeader}>{title}</Text>
                        )}
                        ListFooterComponent={() => (
                            <TouchableOpacity
                                style={[
                                    styles.continueButton,
                                    (!selectedDate || !timeSlots.some(slot => slot.selected)) &&
                                        styles.continueButtonDisabled,
                                ]}
                                onPress={handleContinuePress}
                                disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
                            >
                                <Text style={styles.continueButtonText}>Continue</Text>
                            </TouchableOpacity>
                        )}
                    />
                </Animated.View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    content: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    calendarContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    calendar: {
        borderRadius: 20,
        paddingVertical: 12,
    },
    sectionHeader: {
        fontSize: 22,
        color: '#fff',
        fontWeight: '600',
        marginVertical: 16,
        textAlign: 'left',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    timeSlot: {
        marginVertical: 6,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeSlotBlur: {
        padding: 20,
    },
    timeSlotSelected: {
        borderColor: '#00cc6a',
        backgroundColor: 'rgba(31, 214, 85, 0.15)',
    },
    timeSlotText: {
        fontSize: 17,
        color: '#FFF',
        textAlign: 'center',
        fontWeight: '500',
    },
    timeSlotTextSelected: {
        color: '#00cc6a',
        fontWeight: '600',
    },
    continueButton: {
        backgroundColor: '#00cc6a',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
        shadowColor: '#00cc6a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    continueButtonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: 'transparent',
    },
    continueButtonText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default MyCalendar;





// import React, { useState, useEffect, useLayoutEffect } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     Alert,
//     ImageBackground,
//     ActivityIndicator,
//     Animated,
//     SectionList,
//     Dimensions,
//     Platform,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { StatusBar } from 'expo-status-bar';
// import { BlurView } from 'expo-blur';
// import backgroundImage from '@/assets/images/bgImg.jpeg';

// const { width } = Dimensions.get('window');
// const HEADER_HEIGHT = 70; // Match this with your header height

// type TimeSlot = {
//     time: string;
//     selected: boolean;
// };

// const availableTimeSlots: TimeSlot[] = [
//     { time: '9:00 AM - 10:00 AM', selected: false },
//     { time: '10:00 AM - 11:00 AM', selected: false },
//     { time: '1:00 PM - 2:00 PM', selected: false },
//     { time: '3:00 PM - 4:00 PM', selected: false },
// ];

// type DateObject = {
//     day: number;
//     month: number;
//     year: number;
//     dateString: string;
//     timestamp: number;
// };

// const MyCalendar: React.FC = () => {
//     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
//     const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
//     const [isLoading, setIsLoading] = useState(true);
//     const fadeAnim = useState(new Animated.Value(0))[0];
//     const slideAnim = useState(new Animated.Value(50))[0];
//     const router = useRouter();
//     const insets = useSafeAreaInsets();


//     useEffect(() => {
//         Animated.parallel([
//             Animated.timing(fadeAnim, {
//                 toValue: 1,
//                 duration: 800,
//                 useNativeDriver: true,
//             }),
//             Animated.spring(slideAnim, {
//                 toValue: 0,
//                 tension: 40,
//                 friction: 8,
//                 useNativeDriver: true,
//             })
//         ]).start(() => setIsLoading(false));
//     }, []);

//     const handleDatePress = (date: DateObject) => {
//         setSelectedDate(date);
//         setTimeSlots(availableTimeSlots);
//     };

//     const handleTimeSlotPress = (index: number) => {
//         const updatedTimeSlots = timeSlots.map((slot, idx) => ({
//             ...slot,
//             selected: idx === index ? !slot.selected : false,
//         }));
//         setTimeSlots(updatedTimeSlots);
//     };

//     const handleContinuePress = () => {
//         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
//             Alert.alert('Incomplete Selection', 'Please select both a date and time slot.');
//             return;
//         }
//         router.push('/(authenticated)/(tabs)/Checklist/Checklist');
//     };

//     if (isLoading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#1fd655" />
//             </View>
//         );
//     }

//     const sections: any = [
//         { title: 'Select Your Preferred Date', data: ['calendar'] },
//         { title: 'Choose Available Time Slot', data: timeSlots },
//     ];

//     return (
//         <ImageBackground 
//             source={backgroundImage} 
//             resizeMode="cover" 
//             style={styles.backgroundImage}
//         >
//             <StatusBar style="light" />
//             <SafeAreaView style={styles.container}>
//                 <Animated.View 
//                     style={[
//                         styles.content, 
//                         { 
//                             opacity: fadeAnim,
//                             transform: [{ translateY: slideAnim }]
//                         }
//                     ]}
//                 >
//                     <SectionList
//                         sections={sections}
//                         keyExtractor={(item, index) => 
//                             typeof item === 'string' ? item : item.time || index.toString()
//                         }
//                         contentContainerStyle={styles.listContainer}
//                         renderItem={({ item, index, section }) => {
//                             if (section.title.includes('Date')) {
//                                 return (
//                                     <BlurView intensity={40} tint="dark" style={styles.calendarContainer}>
//                                         <Calendar
//                                             style={styles.calendar}
//                                             onDayPress={handleDatePress}
//                                             minDate={new Date().toISOString().split('T')[0]}
//                                             theme={{
//                                                 backgroundColor: 'transparent',
//                                                 calendarBackground: 'transparent',
//                                                 selectedDayBackgroundColor: '#1fd655',
//                                                 selectedDayTextColor: '#FFF',
//                                                 todayTextColor: '#1fd655',
//                                                 dayTextColor: '#FFF',
//                                                 textDisabledColor: 'rgba(255, 255, 255, 0.3)',
//                                                 arrowColor: '#1fd655',
//                                                 monthTextColor: '#FFF',
//                                                 textDayFontSize: 16,
//                                                 textMonthFontSize: 18,
//                                                 textDayHeaderFontSize: 14,
//                                             }}
//                                             markedDates={
//                                                 selectedDate
//                                                     ? {
//                                                           [selectedDate.dateString]: {
//                                                               selected: true,
//                                                               selectedColor: '#1fd655',
//                                                           },
//                                                       }
//                                                     : {}
//                                             }
//                                         />
//                                     </BlurView>
//                                 );
//                             } else if (typeof item !== 'string') {
//                                 return (
//                                     <TouchableOpacity
//                                         style={[
//                                             styles.timeSlot,
//                                             item.selected && styles.timeSlotSelected,
//                                         ]}
//                                         onPress={() => handleTimeSlotPress(index)}
//                                     >
//                                         <BlurView intensity={40} tint="dark" style={styles.timeSlotBlur}>
//                                             <Text style={[
//                                                 styles.timeSlotText,
//                                                 item.selected && styles.timeSlotTextSelected,
//                                             ]}>
//                                                 {item.time}
//                                             </Text>
//                                         </BlurView>
//                                     </TouchableOpacity>
//                                 );
//                             }
//                             return null;
//                         }}
//                         renderSectionHeader={({ section: { title } }) => (
//                             <Text style={styles.sectionHeader}>{title}</Text>
//                         )}
//                         ListFooterComponent={() => (
//                             <TouchableOpacity
//                                 style={[
//                                     styles.continueButton,
//                                     (!selectedDate || !timeSlots.some(slot => slot.selected)) &&
//                                         styles.continueButtonDisabled,
//                                 ]}
//                                 onPress={handleContinuePress}
//                                 disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
//                             >
//                                 <Text style={styles.continueButtonText}>Continue</Text>
//                             </TouchableOpacity>
//                         )}
//                     />
//                 </Animated.View>
//             </SafeAreaView>
//         </ImageBackground>
//     );
// };

// const styles = StyleSheet.create({
//     backgroundImage: {
//         flex: 1,
//         backgroundColor: '#1a1a1a',
//     },
//     container: {
//         flex: 1,
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#1a1a1a',
//     },
//     content: {
//         flex: 1,
//     },
//     listContainer: {
//         paddingHorizontal: 16,
//         paddingBottom: 30,
//     },
//     calendarContainer: {
//         borderRadius: 20,
//         overflow: 'hidden',
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.1)',
//     },
//     calendar: {
//         borderRadius: 20,
//         paddingVertical: 12,
//     },
//     sectionHeader: {
//         fontSize: 22,
//         color: '#fff',
//         fontWeight: '600',
//         marginVertical: 16,
//         textAlign: 'left',
//         textShadowColor: 'rgba(0, 0, 0, 0.3)',
//         textShadowOffset: { width: 0, height: 2 },
//         textShadowRadius: 4,
//     },
//     timeSlot: {
//         marginVertical: 6,
//         borderRadius: 16,
//         overflow: 'hidden',
//         borderWidth: 1,
//         borderColor: 'rgba(255, 255, 255, 0.1)',
//     },
//     timeSlotBlur: {
//         padding: 20,
//     },
//     timeSlotSelected: {
//         borderColor: '#1fd655',
//         backgroundColor: 'rgba(31, 214, 85, 0.15)',
//     },
//     timeSlotText: {
//         fontSize: 17,
//         color: '#FFF',
//         textAlign: 'center',
//         fontWeight: '500',
//     },
//     timeSlotTextSelected: {
//         color: '#1fd655',
//         fontWeight: '600',
//     },
//     continueButton: {
//         backgroundColor: '#1fd655',
//         padding: 18,
//         borderRadius: 16,
//         alignItems: 'center',
//         marginTop: 24,
//         marginBottom: 20,
//         shadowColor: '#1fd655',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 8,
//         elevation: 8,
//     },
//     continueButtonDisabled: {
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         shadowColor: 'transparent',
//     },
//     continueButtonText: {
//         fontSize: 18,
//         color: '#FFF',
//         fontWeight: '600',
//         letterSpacing: 0.5,
//     },
// });

// export default MyCalendar;


// // import React, { useState, useEffect } from 'react';
// // import {
// //     View,
// //     Text,
// //     TouchableOpacity,
// //     StyleSheet,
// //     Alert,
// //     ImageBackground,
// //     ActivityIndicator,
// //     Animated,
// //     SectionList,
// // } from 'react-native';
// // import { Calendar } from 'react-native-calendars';
// // import { useRouter } from 'expo-router';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { StatusBar } from 'expo-status-bar';
// // import backgroundImage from '@/assets/images/bgImg.jpeg';

// // type TimeSlot = {
// //     time: string;
// //     selected: boolean;
// // };

// // const availableTimeSlots: TimeSlot[] = [
// //     { time: '9:00 AM - 10:00 AM', selected: false },
// //     { time: '10:00 AM - 11:00 AM', selected: false },
// //     { time: '1:00 PM - 2:00 PM', selected: false },
// //     { time: '3:00 PM - 4:00 PM', selected: false },
// // ];

// // type DateObject = {
// //     day: number;
// //     month: number;
// //     year: number;
// //     dateString: string;
// //     timestamp: number;
// // };

// // type SectionData = { title: string; data: string[] | TimeSlot[] };

// // const MyCalendar: React.FC = () => {
// //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// //     const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const fadeAnim = useState(new Animated.Value(0))[0];
// //     const router = useRouter();

// //     useEffect(() => {
// //         Animated.timing(fadeAnim, {
// //             toValue: 1,
// //             duration: 800,
// //             useNativeDriver: true,
// //         }).start(() => setIsLoading(false));
// //     }, []);

// //     const handleDatePress = (date: DateObject) => {
// //         setSelectedDate(date);
// //         setTimeSlots(availableTimeSlots);
// //     };

// //     const handleTimeSlotPress = (index: number) => {
// //         const updatedTimeSlots = timeSlots.map((slot, idx) => ({
// //             ...slot,
// //             selected: idx === index ? !slot.selected : false,
// //         }));
// //         setTimeSlots(updatedTimeSlots);
// //     };

// //     const handleContinuePress = () => {
// //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// //             Alert.alert('Incomplete Selection', 'Please select both a date and a time slot to continue.');
// //             return;
// //         }
// //         router.push('/(authenticated)/(tabs)/CheckList');
// //     };

// //     if (isLoading) {
// //         return (
// //             <View style={styles.loadingContainer}>
// //                 <ActivityIndicator size="large" color="#F39C12" />
// //             </View>
// //         );
// //     }

// //     const sections: any = [
// //         { title: 'Pick a Date & Time', data: ['calendar'] },
// //         { title: 'Available Time Slots', data: timeSlots },
// //     ];

// //     return (
// //         <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage}>
// //             <StatusBar style="light" />
// //             <SafeAreaView style={styles.container}>
// //                 <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
// //                     <SectionList
// //                         sections={sections}
// //                         keyExtractor={(item, index) =>
// //                             typeof item === 'string' ? item : item.time || index.toString()
// //                         }
// //                         renderItem={({ item, index, section }) => {
// //                             if (section.title === 'Pick a Date & Time') {
// //                                 return (
// //                                     <Calendar
// //                                         style={styles.calendar}
// //                                         onDayPress={handleDatePress}
// //                                         minDate={new Date().toISOString().split('T')[0]}
// //                                         theme={{
// //                                             backgroundColor: 'transparent',
// //                                             calendarBackground: 'rgba(0, 0, 0, 0.3)',
// //                                             selectedDayBackgroundColor: '#F39C12',
// //                                             selectedDayTextColor: '#FFF',
// //                                             todayTextColor: '#F39C12',
// //                                             dayTextColor: '#FFF',
// //                                             arrowColor: '#F39C12',
// //                                             monthTextColor: '#FFF',
// //                                         }}
// //                                         markedDates={
// //                                             selectedDate
// //                                                 ? {
// //                                                       [selectedDate.dateString]: {
// //                                                           selected: true,
// //                                                           selectedColor: '#F39C12',
// //                                                           selectedTextColor: '#FFF',
// //                                                       },
// //                                                   }
// //                                                 : {}
// //                                         }
// //                                     />
// //                                 );
// //                             } else if (typeof item !== 'string') {
// //                                 return (
// //                                     <TouchableOpacity
// //                                         style={[
// //                                             styles.timeSlot,
// //                                             item.selected && styles.timeSlotSelected,
// //                                         ]}
// //                                         onPress={() => handleTimeSlotPress(index)}
// //                                     >
// //                                         <Text
// //                                             style={[
// //                                                 styles.timeSlotText,
// //                                                 item.selected && styles.timeSlotTextSelected,
// //                                             ]}
// //                                         >
// //                                             {item.time}
// //                                         </Text>
// //                                     </TouchableOpacity>
// //                                 );
// //                             }
// //                             return null;
// //                         }}
// //                         renderSectionHeader={({ section: { title } }) => (
// //                             <Text style={styles.sectionHeader}>{title}</Text>
// //                         )}
// //                         ListFooterComponent={() => (
// //                             <TouchableOpacity
// //                                 style={[
// //                                     styles.continueButton,
// //                                     (!selectedDate || !timeSlots.some(slot => slot.selected)) &&
// //                                         styles.continueButtonDisabled,
// //                                 ]}
// //                                 onPress={handleContinuePress}
// //                                 disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
// //                             >
// //                                 <Text style={styles.continueButtonText}>Continue</Text>
// //                             </TouchableOpacity>
// //                         )}
// //                     />
// //                 </Animated.View>
// //             </SafeAreaView>
// //         </ImageBackground>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     backgroundImage: { flex: 1, backgroundColor: '#333' },
// //     container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 16 },
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A202C' },
// //     content: { flex: 1 },
// //     calendar: { borderRadius: 16, paddingVertical: 12, marginBottom: 20 },
// //     sectionHeader: {
// //         fontSize: 20,
// //         color: '#F39C12',
// //         fontWeight: 'bold',
// //         marginVertical: 10,
// //         textAlign: 'center',
// //     },
// //     timeSlot: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         padding: 15,
// //         marginVertical: 6,
// //         borderRadius: 12,
// //         backgroundColor: 'rgba(255, 255, 255, 0.15)',
// //     },
// //     timeSlotSelected: { backgroundColor: '#F39C12' },
// //     timeSlotText: { fontSize: 17, color: '#FFF', flex: 1, textAlign: 'center' },
// //     timeSlotTextSelected: { color: '#FFF', fontWeight: 'bold' },
// //     continueButton: {
// //         backgroundColor: '#F39C12',
// //         padding: 15,
// //         borderRadius: 30,
// //         alignItems: 'center',
// //         marginTop: 20,
// //     },
// //     continueButtonDisabled: { backgroundColor: '#A0AEC0' },
// //     continueButtonText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
// // });

// // export default MyCalendar;



// // // import React, { useState, useEffect } from 'react';
// // // import {
// // //     View,
// // //     Text,
// // //     TouchableOpacity,
// // //     StyleSheet,
// // //     Alert,
// // //     ImageBackground,
// // //     ActivityIndicator,
// // //     Animated,
// // //     SectionList,
// // // } from 'react-native';
// // // import { Calendar } from 'react-native-calendars';
// // // import { useRouter } from 'expo-router';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import { StatusBar } from 'expo-status-bar';
// // // import backgroundImage from '@/assets/images/bgImg.jpeg';

// // // type TimeSlot = {
// // //     time: string;
// // //     selected: boolean;
// // // };

// // // const availableTimeSlots: TimeSlot[] = [
// // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // ];

// // // type DateObject = {
// // //     day: number;
// // //     month: number;
// // //     year: number;
// // //     dateString: string; // Format: 'YYYY-MM-DD'
// // //     timestamp: number;
// // // };

// // // const MyCalendar: React.FC = () => {
// // //     const [selectedDate, setSelectedDate] = useState<any>(null);
// // //     const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
// // //     const [isLoading, setIsLoading] = useState(true);
// // //     const fadeAnim = useState(new Animated.Value(0))[0];
// // //     const router = useRouter();

// // //     useEffect(() => {
// // //         Animated.timing(fadeAnim, {
// // //             toValue: 1,
// // //             duration: 800,
// // //             useNativeDriver: true,
// // //         }).start(() => setIsLoading(false));
// // //     }, []);

// // //     const handleDatePress = (date: DateObject) => {
// // //         setSelectedDate(date);
// // //         setTimeSlots(availableTimeSlots);
// // //     };

// // //     const handleTimeSlotPress = (index: number) => {
// // //         const updatedTimeSlots = timeSlots.map((slot, idx) => ({
// // //             ...slot,
// // //             selected: idx === index ? !slot.selected : false,
// // //         }));
// // //         setTimeSlots(updatedTimeSlots);
// // //     };

// // //     const handleContinuePress = () => {
// // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // //             Alert.alert('Incomplete Selection', 'Please select both a date and a time slot to continue.');
// // //             return;
// // //         }
// // //         router.push('/(authenticated)/(tabs)/CheckList');
// // //     };

// // //     if (isLoading) {
// // //         return (
// // //             <View style={styles.loadingContainer}>
// // //                 <ActivityIndicator size="large" color="#F39C12" />
// // //             </View>
// // //         );
// // //     }

// // //     const sections = [
// // //         { title: 'Pick a Date & Time', data: ['calendar'] },
// // //         { title: 'Available Time Slots', data: timeSlots },
// // //     ];

// // //     return (
// // //         <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage}>
// // //             <StatusBar style="light" />
// // //             <SafeAreaView style={styles.container}>
// // //                 <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
// // //                     <SectionList
// // //                         sections={sections}
// // //                         keyExtractor={(item, index) => item.time || index.toString()}
// // //                         renderItem={({ item, index }) =>
// // //                             typeof item === 'string' ? (
// // //                                 <Calendar
// // //                                     style={styles.calendar}
// // //                                     onDayPress={handleDatePress}
// // //                                     minDate={new Date().toISOString().split('T')[0]}
// // //                                     theme={{
// // //                                         backgroundColor: 'transparent',
// // //                                         calendarBackground: 'rgba(0, 0, 0, 0.3)',
// // //                                         selectedDayBackgroundColor: '#F39C12',
// // //                                         selectedDayTextColor: '#FFF',
// // //                                         todayTextColor: '#F39C12',
// // //                                         dayTextColor: '#FFF',
// // //                                         arrowColor: '#F39C12',
// // //                                         monthTextColor: '#FFF',
// // //                                     }}
// // //                                     markedDates={
// // //                                         selectedDate
// // //                                             ? {
// // //                                                   [selectedDate.dateString]: {
// // //                                                       selected: true,
// // //                                                       selectedColor: '#F39C12',
// // //                                                       selectedTextColor: '#FFF',
// // //                                                   },
// // //                                               }
// // //                                             : {}
// // //                                     }
// // //                                 />
// // //                             ) : (
// // //                                 <TouchableOpacity
// // //                                     style={[
// // //                                         styles.timeSlot,
// // //                                         item.selected && styles.timeSlotSelected,
// // //                                     ]}
// // //                                     onPress={() => handleTimeSlotPress(index)}
// // //                                 >
// // //                                     <Text
// // //                                         style={[
// // //                                             styles.timeSlotText,
// // //                                             item.selected && styles.timeSlotTextSelected,
// // //                                         ]}
// // //                                     >
// // //                                         {item.time}
// // //                                     </Text>
// // //                                 </TouchableOpacity>
// // //                             )
// // //                         }
// // //                         renderSectionHeader={({ section: { title } }) => (
// // //                             <Text style={styles.sectionHeader}>{title}</Text>
// // //                         )}
// // //                         ListFooterComponent={() => (
// // //                             <TouchableOpacity
// // //                                 style={[
// // //                                     styles.continueButton,
// // //                                     (!selectedDate || !timeSlots.some(slot => slot.selected)) &&
// // //                                         styles.continueButtonDisabled,
// // //                                 ]}
// // //                                 onPress={handleContinuePress}
// // //                                 disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
// // //                             >
// // //                                 <Text style={styles.continueButtonText}>Continue</Text>
// // //                             </TouchableOpacity>
// // //                         )}
// // //                     />
// // //                 </Animated.View>
// // //             </SafeAreaView>
// // //         </ImageBackground>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     backgroundImage: { flex: 1, backgroundColor: '#333' },
// // //     container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 16 },
// // //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A202C' },
// // //     content: { flex: 1 },
// // //     calendar: { borderRadius: 16, paddingVertical: 12, marginBottom: 20 },
// // //     sectionHeader: {
// // //         fontSize: 20,
// // //         color: '#F39C12',
// // //         fontWeight: 'bold',
// // //         marginVertical: 10,
// // //         textAlign: 'center',
// // //     },
// // //     timeSlot: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         padding: 15,
// // //         marginVertical: 6,
// // //         borderRadius: 12,
// // //         backgroundColor: 'rgba(255, 255, 255, 0.15)',
// // //     },
// // //     timeSlotSelected: { backgroundColor: '#F39C12' },
// // //     timeSlotText: { fontSize: 17, color: '#FFF', flex: 1, textAlign: 'center' },
// // //     timeSlotTextSelected: { color: '#FFF', fontWeight: 'bold' },
// // //     continueButton: {
// // //         backgroundColor: '#F39C12',
// // //         padding: 15,
// // //         borderRadius: 30,
// // //         alignItems: 'center',
// // //         marginTop: 20,
// // //     },
// // //     continueButtonDisabled: { backgroundColor: '#A0AEC0' },
// // //     continueButtonText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },
// // // });

// // // export default MyCalendar;





// // // // import React, { useState, useEffect } from 'react';
// // // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // // import {
// // // //     View,
// // // //     Text,
// // // //     TouchableOpacity,
// // // //     StyleSheet,
// // // //     Alert,
// // // //     ImageBackground,
// // // //     Animated,
// // // //     ActivityIndicator,
// // // //     Dimensions,
// // // //     FlatList
// // // // } from 'react-native';
// // // // import { Calendar } from 'react-native-calendars';
// // // // import { useRouter } from 'expo-router';
// // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // import { StatusBar } from 'expo-status-bar';
// // // // import { Feather } from '@expo/vector-icons';
// // // // import { BlurView } from 'expo-blur';
// // // // import backgroundImage from '@/assets/images/bgImg.jpeg'

// // // // type DateObject = {
// // // //     day: number;
// // // //     month: number;
// // // //     year: number;
// // // //     dateString: string; // Format: 'YYYY-MM-DD'
// // // //     timestamp: number;
// // // // };

// // // // const { width } = Dimensions.get('window');

// // // // const availableTimeSlots = [
// // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // // ];

// // // // const MyCalendar: React.FC = () => {
// // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // //     const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
// // // //     const [isLoading, setIsLoading] = useState(true);
// // // //     const fadeAnim = useState(new Animated.Value(0))[0];
// // // //     const scaleAnim = useState(new Animated.Value(0.95))[0];
// // // //     const router = useRouter();

// // // //     useEffect(() => {
// // // //         loadBookingState();
// // // //         Animated.parallel([
// // // //             Animated.timing(fadeAnim, {
// // // //                 toValue: 1,
// // // //                 duration: 800,
// // // //                 useNativeDriver: true,
// // // //             }),
// // // //             Animated.spring(scaleAnim, {
// // // //                 toValue: 1,
// // // //                 friction: 8,
// // // //                 tension: 40,
// // // //                 useNativeDriver: true,
// // // //             }),
// // // //         ]).start(() => setIsLoading(false));
// // // //     }, []);

// // // //     const loadBookingState = async () => {
// // // //         try {
// // // //             const savedState = await AsyncStorage.getItem('bookingState');
// // // //             if (savedState) {
// // // //                 const { selectedDate, selectedTimeSlot } = JSON.parse(savedState);
// // // //                 setSelectedDate(selectedDate);
// // // //                 setTimeSlots(timeSlots.map(slot => ({
// // // //                     ...slot,
// // // //                     selected: slot.time === selectedTimeSlot,
// // // //                 })));
// // // //             }
// // // //         } catch (error) {
// // // //             console.error('Error loading booking state:', error);
// // // //         }
// // // //     };

// // // //     const saveBookingState = async (date: DateObject | null, selectedTime: string | null) => {
// // // //         try {
// // // //             const bookingState = { selectedDate: date, selectedTimeSlot: selectedTime };
// // // //             await AsyncStorage.setItem('bookingState', JSON.stringify(bookingState));
// // // //         } catch (error) {
// // // //             console.error('Error saving booking state:', error);
// // // //         }
// // // //     };

// // // //     const handleDatePress = (date: DateObject) => {
// // // //         setSelectedDate(date);
// // // //         setTimeSlots(availableTimeSlots);
// // // //         Animated.sequence([
// // // //             Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
// // // //             Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
// // // //         ]).start();
// // // //         saveBookingState(date, null);
// // // //     };

// // // //     const handleTimeSlotPress = (index: number) => {
// // // //         setTimeSlots(timeSlots.map((slot, idx) => ({
// // // //             ...slot,
// // // //             selected: idx === index ? !slot.selected : false,
// // // //         })));
// // // //         saveBookingState(selectedDate, timeSlots[index].time);
// // // //     };

// // // //     const handleContinuePress = () => {
// // // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // // //             Alert.alert('Incomplete Selection', 'Please select both a date and a time slot to continue.', [{ text: 'OK' }]);
// // // //             return;
// // // //         }
// // // //         router.push({
// // // //             pathname: '/(authenticated)/(tabs)/CheckList',
// // // //             params: { date: selectedDate?.dateString, time: timeSlots.find(slot => slot.selected)?.time },
// // // //         });
// // // //     };

// // // //     if (isLoading) {
// // // //         return (
// // // //             <View style={styles.loadingContainer}>
// // // //                 <ActivityIndicator size="large" color="#4299E1" />
// // // //             </View>
// // // //         );
// // // //     }

// // // //     return (
// // // //         <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage}>
// // // //             <StatusBar style="light" />
// // // //             <SafeAreaView style={styles.container}>
// // // //                 <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
// // // //                     <FlatList
// // // //                         data={timeSlots}
// // // //                         keyExtractor={(item) => item.time}
// // // //                         ListHeaderComponent={() => (
// // // //                             <View style={styles.calendarContainer}>
// // // //                                 <Calendar
// // // //                                     style={styles.calendar}
// // // //                                     onDayPress={handleDatePress}
// // // //                                     minDate={new Date().toISOString().split('T')[0]}
// // // //                                     theme={{
// // // //                                         backgroundColor: 'transparent',
// // // //                                         calendarBackground: 'rgba(255,255,255,0.98)',
// // // //                                         selectedDayBackgroundColor: '#4299E1',
// // // //                                         selectedDayTextColor: '#fff',
// // // //                                         todayTextColor: '#4299E1',
// // // //                                         dayTextColor: '#2D3748',
// // // //                                         arrowColor: '#4299E1',
// // // //                                         monthTextColor: '#2D3748',
// // // //                                     }}
// // // //                                     markedDates={selectedDate ? {
// // // //                                         [selectedDate.dateString]: {
// // // //                                             selected: true,
// // // //                                             disableTouchEvent: true,
// // // //                                             selectedColor: '#4299E1',
// // // //                                             selectedTextColor: '#fff'
// // // //                                         }
// // // //                                     } : {}}
// // // //                                 />
// // // //                                 <Text style={styles.timeSlotsTitle}>
// // // //                                     Available Times for {selectedDate?.dateString || 'selected date'}
// // // //                                 </Text>
// // // //                             </View>
// // // //                         )}
// // // //                         renderItem={({ item, index }) => (
// // // //                             <TouchableOpacity
// // // //                                 style={[styles.timeSlot, item.selected && styles.timeSlotSelected]}
// // // //                                 onPress={() => handleTimeSlotPress(index)}
// // // //                             >
// // // //                                 <Feather name={item.selected ? "check-circle" : "clock"} size={20} color={item.selected ? "#fff" : "#4299E1"} />
// // // //                                 <Text style={[styles.timeSlotText, item.selected && styles.timeSlotTextSelected]}>
// // // //                                     {item.time}
// // // //                                 </Text>
// // // //                             </TouchableOpacity>
// // // //                         )}
// // // //                         ListFooterComponent={() => (
// // // //                             <TouchableOpacity 
// // // //                                 style={[styles.continueButton, (!selectedDate || !timeSlots.some(slot => slot.selected)) && styles.continueButtonDisabled]}
// // // //                                 onPress={handleContinuePress}
// // // //                                 disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
// // // //                             >
// // // //                                 <Text style={styles.continueButtonText}>Continue</Text>
// // // //                                 <Feather name="arrow-right" size={20} color="#fff" />
// // // //                             </TouchableOpacity>
// // // //                         )}
// // // //                     />
// // // //                 </Animated.View>
// // // //             </SafeAreaView>
// // // //         </ImageBackground>
// // // //     );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //     backgroundImage: { flex: 1, backgroundColor: '#0d58ee' },
// // // //     container: { flex: 1, backgroundColor: 'rgba(26, 32, 44, 0.9)', paddingHorizontal: 16 },
// // // //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A202C' },
// // // //     content: { flex: 1, gap: 24 },
// // // //     calendarContainer: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#F7FAFC', padding: 16 },
// // // //     calendar: { borderRadius: 16, paddingVertical: 12 },
// // // //     timeSlotsTitle: { fontSize: 20, color: '#2D3748', marginVertical: 20, fontWeight: '600' },
// // // //     timeSlot: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: '#EDF2F7', marginBottom: 12 },
// // // //     timeSlotSelected: { backgroundColor: '#4299E1', borderColor: '#4299E1' },
// // // //     timeSlotText: { fontSize: 17, color: '#2D3748', flex: 1 },
// // // //     timeSlotTextSelected: { color: '#FFF' },
// // // //     continueButton: { flexDirection: 'row', backgroundColor: '#4299E1', padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
// // // //     continueButtonDisabled: { backgroundColor: '#A0AEC0' },
// // // //     continueButtonText: { color: '#FFF', fontSize: 17, fontWeight: '600' },
// // // // });

// // // // export default MyCalendar;





// // // // // import React, { useState, useEffect } from 'react';
// // // // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // // // import {
// // // // //     View,
// // // // //     Text,
// // // // //     TouchableOpacity,
// // // // //     StyleSheet,
// // // // //     Alert,
// // // // //     ImageBackground,
// // // // //     Animated,
// // // // //     ActivityIndicator,
// // // // //     Dimensions,
// // // // //     FlatList
// // // // // } from 'react-native';
// // // // // import { Calendar } from 'react-native-calendars';
// // // // // import { useRouter } from 'expo-router';
// // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // import { StatusBar } from 'expo-status-bar';
// // // // // import { Feather } from '@expo/vector-icons';
// // // // // import { BlurView } from 'expo-blur';

// // // // // type DateObject = {
// // // // //     day: number;
// // // // //     month: number;
// // // // //     year: number;
// // // // //     dateString: string; // Format: 'YYYY-MM-DD'
// // // // //     timestamp: number;
// // // // //   };

// // // // // const { width } = Dimensions.get('window');

// // // // // // Define data structure and state
// // // // // const availableTimeSlots = [
// // // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // // //     // ...more slots
// // // // // ];

// // // // // const MyCalendar: React.FC = () => {
// // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // //     const [timeSlots, setTimeSlots] = useState(availableTimeSlots);
// // // // //     const [isLoading, setIsLoading] = useState(true);
// // // // //     const [fadeAnim] = useState(new Animated.Value(0));
// // // // //     const [scaleAnim] = useState(new Animated.Value(0.95));
// // // // //     const router = useRouter();

// // // // //     // Load saved booking state
// // // // //     useEffect(() => {
// // // // //         loadBookingState();
// // // // //     }, []);

// // // // //     // Initial animation
// // // // //     useEffect(() => {
// // // // //         Animated.parallel([
// // // // //             Animated.timing(fadeAnim, {
// // // // //                 toValue: 1,
// // // // //                 duration: 800,
// // // // //                 useNativeDriver: true,
// // // // //             }),
// // // // //             Animated.spring(scaleAnim, {
// // // // //                 toValue: 1,
// // // // //                 friction: 8,
// // // // //                 tension: 40,
// // // // //                 useNativeDriver: true,
// // // // //             }),
// // // // //         ]).start(() => setIsLoading(false));
// // // // //     }, []);

// // // // //     const loadBookingState = async () => {
// // // // //         try {
// // // // //             const savedState = await AsyncStorage.getItem('bookingState');
// // // // //             if (savedState) {
// // // // //                 const { selectedDate, selectedTimeSlot } = JSON.parse(savedState);
// // // // //                 if (selectedDate) {
// // // // //                     setSelectedDate(selectedDate);
// // // // //                     const updatedTimeSlots = timeSlots.map(slot => ({
// // // // //                         ...slot,
// // // // //                         selected: slot.time === selectedTimeSlot,
// // // // //                     }));
// // // // //                     setTimeSlots(updatedTimeSlots);
// // // // //                 }
// // // // //             }
// // // // //         } catch (error) {
// // // // //             console.error('Error loading booking state:', error);
// // // // //         }
// // // // //     };

// // // // //     const saveBookingState = async (date: DateObject | null, selectedTime: string | null) => {
// // // // //         try {
// // // // //             const bookingState = {
// // // // //                 selectedDate: date,
// // // // //                 selectedTimeSlot: selectedTime,
// // // // //             };
// // // // //             await AsyncStorage.setItem('bookingState', JSON.stringify(bookingState));
// // // // //         } catch (error) {
// // // // //             console.error('Error saving booking state:', error);
// // // // //         }
// // // // //     };

// // // // //     const handleDatePress = (date: DateObject) => {
// // // // //         setSelectedDate(date);
// // // // //         setTimeSlots(availableTimeSlots);
// // // // //         Animated.sequence([
// // // // //             Animated.timing(fadeAnim, {
// // // // //                 toValue: 0,
// // // // //                 duration: 150,
// // // // //                 useNativeDriver: true,
// // // // //             }),
// // // // //             Animated.timing(fadeAnim, {
// // // // //                 toValue: 1,
// // // // //                 duration: 300,
// // // // //                 useNativeDriver: true,
// // // // //             }),
// // // // //         ]).start();
// // // // //         saveBookingState(date, null);
// // // // //     };

// // // // //     const handleTimeSlotPress = (index: number) => {
// // // // //         const updatedTimeSlots = timeSlots.map((slot, idx) => ({
// // // // //             ...slot,
// // // // //             selected: idx === index ? !slot.selected : false,
// // // // //         }));
// // // // //         setTimeSlots(updatedTimeSlots);
// // // // //         const selectedTime = updatedTimeSlots[index].selected ? updatedTimeSlots[index].time : null;
// // // // //         saveBookingState(selectedDate, selectedTime);
// // // // //     };

// // // // //     const handleContinuePress = () => {
// // // // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // // // //             Alert.alert(
// // // // //                 'Incomplete Selection',
// // // // //                 'Please select both a date and a time slot to continue.',
// // // // //                 [{ text: 'OK', style: 'default' }],
// // // // //                 { cancelable: true }
// // // // //             );
// // // // //             return;
// // // // //         }
// // // // //         const selectedTime: any = timeSlots.find(slot => slot.selected)?.time;
// // // // //         saveBookingState(selectedDate, selectedTime);
// // // // //         router.push({
// // // // //             pathname: '/(authenticated)/(tabs)/CheckList',
// // // // //             params: {
// // // // //                 date: selectedDate.dateString,
// // // // //                 time: selectedTime,
// // // // //             },
// // // // //         });
// // // // //     };

// // // // //     const getTodayString = () => {
// // // // //         const today = new Date();
// // // // //         return today.toISOString().split('T')[0];
// // // // //     };

// // // // //     if (isLoading) {
// // // // //         return (
// // // // //             <View style={styles.loadingContainer}>
// // // // //                 <ActivityIndicator size="large" color="#4299E1" />
// // // // //             </View>
// // // // //         );
// // // // //     }

// // // // //     return (
// // // // //         <ImageBackground
// // // // //             source={{ uri: 'https://source.unsplash.com/random/800x600?gradient' }}
// // // // //             resizeMode="cover"
// // // // //             style={styles.backgroundImage}
// // // // //         >
// // // // //             <StatusBar style="light" />
// // // // //             <SafeAreaView style={styles.container}>
// // // // //                 <FlatList
// // // // //                     data={timeSlots}
// // // // //                     keyExtractor={(item) => item.time}
// // // // //                     ListHeaderComponent={() => (
// // // // //                         <View style={styles.calendarContainer}>
// // // // //                             <Calendar
// // // // //                                 style={styles.calendar}
// // // // //                                 onDayPress={handleDatePress}
// // // // //                                 minDate={getTodayString()}
// // // // //                                 theme={{
// // // // //                                     backgroundColor: 'transparent',
// // // // //                                     calendarBackground: 'rgba(255,255,255,0.98)',
// // // // //                                     textSectionTitleColor: '#2D3748',
// // // // //                                     selectedDayBackgroundColor: '#4299E1',
// // // // //                                     selectedDayTextColor: '#ffffff',
// // // // //                                     todayTextColor: '#4299E1',
// // // // //                                     dayTextColor: '#2D3748',
// // // // //                                     textDisabledColor: '#CBD5E0',
// // // // //                                     arrowColor: '#4299E1',
// // // // //                                     monthTextColor: '#2D3748',
// // // // //                                     textDayFontFamily: 'System',
// // // // //                                     textMonthFontFamily: 'System',
// // // // //                                     textDayHeaderFontFamily: 'System',
// // // // //                                     textDayFontWeight: '500',
// // // // //                                     textMonthFontWeight: 'bold',
// // // // //                                     textDayHeaderFontWeight: '600',
// // // // //                                 }}
// // // // //                                 markingType={'custom'}
// // // // //                                 markedDates={
// // // // //                                     selectedDate ? {
// // // // //                                         [selectedDate.dateString]: {
// // // // //                                             customStyles: {
// // // // //                                                 container: styles.selectedDateContainer,
// // // // //                                                 text: styles.selectedDateText,
// // // // //                                             },
// // // // //                                         },
// // // // //                                     } : {}
// // // // //                                 }
// // // // //                             />
// // // // //                             <Text style={styles.timeSlotsTitle}>
// // // // //                                 Available Times for {selectedDate?.dateString || 'selected date'}
// // // // //                             </Text>
// // // // //                         </View>
// // // // //                     )}
// // // // //                     renderItem={({ item, index }) => (
// // // // //                         <TouchableOpacity
// // // // //                             style={[
// // // // //                                 styles.timeSlot,
// // // // //                                 item.selected && styles.timeSlotSelected,
// // // // //                             ]}
// // // // //                             onPress={() => handleTimeSlotPress(index)}
// // // // //                             activeOpacity={0.7}
// // // // //                         >
// // // // //                             <Feather 
// // // // //                                 name={item.selected ? "check-circle" : "clock"} 
// // // // //                                 size={20} 
// // // // //                                 color={item.selected ? "#fff" : "#4299E1"} 
// // // // //                             />
// // // // //                             <Text
// // // // //                                 style={[
// // // // //                                     styles.timeSlotText,
// // // // //                                     item.selected && styles.timeSlotTextSelected,
// // // // //                                 ]}
// // // // //                             >
// // // // //                                 {item.time}
// // // // //                             </Text>
// // // // //                         </TouchableOpacity>
// // // // //                     )}
// // // // //                     ListFooterComponent={() => (
// // // // //                         <TouchableOpacity 
// // // // //                             style={[
// // // // //                                 styles.continueButton,
// // // // //                                 (!selectedDate || !timeSlots.some(slot => slot.selected)) && 
// // // // //                                 styles.continueButtonDisabled
// // // // //                             ]}
// // // // //                             onPress={handleContinuePress}
// // // // //                             activeOpacity={0.8}
// // // // //                             disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
// // // // //                         >
// // // // //                             <Text style={styles.continueButtonText}>Continue</Text>
// // // // //                             <Feather name="arrow-right" size={20} color="#fff" />
// // // // //                         </TouchableOpacity>
// // // // //                     )}
// // // // //                 />
// // // // //             </SafeAreaView>
// // // // //         </ImageBackground>
// // // // //     );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //     backgroundImage: {
// // // // //         flex: 1,
// // // // //         backgroundColor: '#1A202C',
// // // // //     },
// // // // //     container: {
// // // // //         flex: 1,
// // // // //         backgroundColor: 'rgba(26, 32, 44, 0.92)',
// // // // //         paddingHorizontal: 16,
// // // // //     },
// // // // //     loadingContainer: {
// // // // //         flex: 1,
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //         backgroundColor: '#1A202C',
// // // // //     },
// // // // //     scrollContainer: {
// // // // //         paddingVertical: 20,
// // // // //     },
// // // // //     content: {
// // // // //         gap: 24,
// // // // //     },
// // // // //     headerContainer: {
// // // // //         alignItems: 'center',
// // // // //         marginBottom: 8,
// // // // //     },
// // // // //     headerBlur: {
// // // // //         flexDirection: 'row',
// // // // //         alignItems: 'center',
// // // // //         justifyContent: 'center',
// // // // //         padding: 16,
// // // // //         borderRadius: 16,
// // // // //         gap: 12,
// // // // //         width: width - 32,
// // // // //         backgroundColor: 'rgba(66, 153, 225, 0.2)',
// // // // //     },
// // // // //     headerText: {
// // // // //         fontSize: 26,
// // // // //         color: '#fff',
// // // // //         fontWeight: 'bold',
// // // // //         letterSpacing: 0.8,
// // // // //     },
// // // // //     calendarContainer: {
// // // // //         borderRadius: 16,
// // // // //         overflow: 'hidden',
// // // // //         elevation: 6,
// // // // //         shadowColor: '#000',
// // // // //         shadowOffset: { width: 0, height: 3 },
// // // // //         shadowOpacity: 0.3,
// // // // //         shadowRadius: 4.5,
// // // // //         backgroundColor: '#F7FAFC',
// // // // //     },
// // // // //     calendar: {
// // // // //         borderRadius: 16,
// // // // //         paddingVertical: 12,
// // // // //     },
// // // // //     selectedDateContainer: {
// // // // //         backgroundColor: '#3182CE',
// // // // //         borderRadius: 10,
// // // // //     },
// // // // //     selectedDateText: {
// // // // //         color: '#FFFFFF',
// // // // //         fontWeight: 'bold',
// // // // //     },
// // // // //     selectedDateLabel: {
// // // // //         color: '#3182CE',
// // // // //         fontWeight: '700',
// // // // //     },
// // // // //     timeSlotsContainer: {
// // // // //         padding: 20,
// // // // //         backgroundColor: 'rgba(255, 255, 255, 0.98)',
// // // // //         borderRadius: 16,
// // // // //         elevation: 5,
// // // // //         shadowColor: '#000',
// // // // //         shadowOffset: { width: 0, height: 2 },
// // // // //         shadowOpacity: 0.2,
// // // // //         shadowRadius: 4,
// // // // //     },
// // // // //     timeSlotsTitle: {
// // // // //         fontSize: 20,
// // // // //         color: '#2D3748',
// // // // //         marginBottom: 20,
// // // // //         fontWeight: '600',
// // // // //     },
// // // // //     timeSlot: {
// // // // //         flexDirection: 'row',
// // // // //         alignItems: 'center',
// // // // //         padding: 16,
// // // // //         marginBottom: 12,
// // // // //         borderRadius: 14,
// // // // //         backgroundColor: '#EDF2F7',
// // // // //         borderWidth: 1,
// // // // //         borderColor: '#E2E8F0',
// // // // //         gap: 14,
// // // // //         elevation: 3,
// // // // //         shadowColor: '#000',
// // // // //         shadowOffset: { width: 0, height: 2 },
// // // // //         shadowOpacity: 0.15,
// // // // //         shadowRadius: 2.5,
// // // // //         transition: 0.2,
// // // // //     },
// // // // //     timeSlotSelected: {
// // // // //         backgroundColor: '#4299E1',
// // // // //         borderColor: '#4299E1',
// // // // //         elevation: 5,
// // // // //         shadowOpacity: 0.3,
// // // // //     },
// // // // //     timeSlotText: {
// // // // //         fontSize: 17,
// // // // //         color: '#2D3748',
// // // // //         fontWeight: '500',
// // // // //         flex: 1,
// // // // //     },
// // // // //     timeSlotTextSelected: {
// // // // //         color: '#FFFFFF',
// // // // //         fontWeight: '700',
// // // // //     },
// // // // //     continueButton: {
// // // // //         flexDirection: 'row',
// // // // //         backgroundColor: '#4299E1',
// // // // //         paddingVertical: 16,
// // // // //         paddingHorizontal: 20,
// // // // //         borderRadius: 14,
// // // // //         alignItems: 'center',
// // // // //         justifyContent: 'center',
// // // // //         gap: 10,
// // // // //         elevation: 5,
// // // // //         shadowColor: '#000',
// // // // //         shadowOffset: { width: 0, height: 3 },
// // // // //         shadowOpacity: 0.25,
// // // // //         shadowRadius: 4,
// // // // //     },
// // // // //     continueButtonDisabled: {
// // // // //         backgroundColor: '#A0AEC0', // A lighter shade to indicate disabled state
// // // // //         shadowOpacity: 0, // No shadow for disabled button
// // // // //     },
// // // // //     continueButtonText: {
// // // // //         color: '#FFFFFF',
// // // // //         fontSize: 17,
// // // // //         fontWeight: '600',
// // // // //     },
// // // // // });


// // // // // export default MyCalendar;



// // // // // // import React, { useState, useEffect } from 'react';
// // // // // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // // // // import { 
// // // // // //     View, 
// // // // // //     Text, 
// // // // // //     FlatList, 
// // // // // //     TouchableOpacity, 
// // // // // //     StyleSheet, 
// // // // // //     Alert, 
// // // // // //     ImageBackground, 
// // // // // //     ScrollView, 
// // // // // //     Animated,
// // // // // //     ActivityIndicator,
// // // // // //     Dimensions
// // // // // // } from 'react-native';
// // // // // // import { Calendar, DateObject } from 'react-native-calendars';
// // // // // // import { useRouter } from 'expo-router';
// // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // import { Feather } from '@expo/vector-icons';
// // // // // // import { BlurView } from 'expo-blur';

// // // // // // const { width } = Dimensions.get('window');

// // // // // // type TimeSlot = {
// // // // // //     time: string;
// // // // // //     selected: boolean;
// // // // // // };

// // // // // // type BookingState = {
// // // // // //     selectedDate: DateObject | null;
// // // // // //     selectedTimeSlot: string | null;
// // // // // // };

// // // // // // const availableTimeSlots: TimeSlot[] = [
// // // // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // // // //     { time: '11:00 AM - 12:00 PM', selected: false },
// // // // // //     { time: '12:00 PM - 1:00 PM', selected: false },
// // // // // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // // // // //     { time: '2:00 PM - 3:00 PM', selected: false },
// // // // // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // // // //     { time: '4:00 PM - 5:00 PM', selected: false },
// // // // // //     { time: '5:00 PM - 6:00 PM', selected: false },
// // // // // // ];

// // // // // // const MyCalendar: React.FC = () => {
// // // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // // //     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);
// // // // // //     const [isLoading, setIsLoading] = useState(true);
// // // // // //     const [fadeAnim] = useState(new Animated.Value(0));
// // // // // //     const [scaleAnim] = useState(new Animated.Value(0.95));
// // // // // //     const router = useRouter();

// // // // // //     // Load saved booking state
// // // // // //     useEffect(() => {
// // // // // //         loadBookingState();
// // // // // //     }, []);

// // // // // //     // Initial animation
// // // // // //     useEffect(() => {
// // // // // //         Animated.parallel([
// // // // // //             Animated.timing(fadeAnim, {
// // // // // //                 toValue: 1,
// // // // // //                 duration: 800,
// // // // // //                 useNativeDriver: true,
// // // // // //             }),
// // // // // //             Animated.spring(scaleAnim, {
// // // // // //                 toValue: 1,
// // // // // //                 friction: 8,
// // // // // //                 tension: 40,
// // // // // //                 useNativeDriver: true,
// // // // // //             }),
// // // // // //         ]).start(() => setIsLoading(false));
// // // // // //     }, []);

// // // // // //     const loadBookingState = async () => {
// // // // // //         try {
// // // // // //             const savedState = await AsyncStorage.getItem('bookingState');
// // // // // //             if (savedState) {
// // // // // //                 const { selectedDate, selectedTimeSlot } = JSON.parse(savedState);
// // // // // //                 if (selectedDate) {
// // // // // //                     setSelectedDate(selectedDate);
// // // // // //                     const updatedTimeSlots = timeSlots.map(slot => ({
// // // // // //                         ...slot,
// // // // // //                         selected: slot.time === selectedTimeSlot,
// // // // // //                     }));
// // // // // //                     setTimeSlots(updatedTimeSlots);
// // // // // //                 }
// // // // // //             }
// // // // // //         } catch (error) {
// // // // // //             console.error('Error loading booking state:', error);
// // // // // //         }
// // // // // //     };

// // // // // //     const saveBookingState = async (date: DateObject | null, selectedTime: string | null) => {
// // // // // //         try {
// // // // // //             const bookingState: BookingState = {
// // // // // //                 selectedDate: date,
// // // // // //                 selectedTimeSlot: selectedTime,
// // // // // //             };
// // // // // //             await AsyncStorage.setItem('bookingState', JSON.stringify(bookingState));
// // // // // //         } catch (error) {
// // // // // //             console.error('Error saving booking state:', error);
// // // // // //         }
// // // // // //     };

// // // // // //     const handleDatePress = (date: DateObject) => {
// // // // // //         setSelectedDate(date);
// // // // // //         setTimeSlots(availableTimeSlots);
        
// // // // // //         Animated.sequence([
// // // // // //             Animated.timing(fadeAnim, {
// // // // // //                 toValue: 0,
// // // // // //                 duration: 150,
// // // // // //                 useNativeDriver: true,
// // // // // //             }),
// // // // // //             Animated.timing(fadeAnim, {
// // // // // //                 toValue: 1,
// // // // // //                 duration: 300,
// // // // // //                 useNativeDriver: true,
// // // // // //             }),
// // // // // //         ]).start();

// // // // // //         saveBookingState(date, null);
// // // // // //     };

// // // // // //     const handleTimeSlotPress = (index: number) => {
// // // // // //         const updatedTimeSlots = timeSlots.map((slot, idx) => ({
// // // // // //             ...slot,
// // // // // //             selected: idx === index ? !slot.selected : false,
// // // // // //         }));
// // // // // //         setTimeSlots(updatedTimeSlots);

// // // // // //         const selectedTime = updatedTimeSlots[index].selected ? updatedTimeSlots[index].time : null;
// // // // // //         saveBookingState(selectedDate, selectedTime);

// // // // // //         // Haptic feedback would be added here
// // // // // //         // Vibration.vibrate(10);
// // // // // //     };

// // // // // //     const handleContinuePress = () => {
// // // // // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // // // // //             Alert.alert(
// // // // // //                 'Incomplete Selection',
// // // // // //                 'Please select both a date and a time slot to continue.',
// // // // // //                 [{ text: 'OK', style: 'default' }],
// // // // // //                 { cancelable: true }
// // // // // //             );
// // // // // //             return;
// // // // // //         }

// // // // // //         const selectedTime = timeSlots.find(slot => slot.selected)?.time;
        
// // // // // //         // Save final state before navigation
// // // // // //         saveBookingState(selectedDate, selectedTime);
        
// // // // // //         // Navigate to next screen with booking details
// // // // // //         router.push({
// // // // // //             pathname: '/(authenticated)/(tabs)/CheckList',
// // // // // //             params: {
// // // // // //                 date: selectedDate.dateString,
// // // // // //                 time: selectedTime,
// // // // // //             },
// // // // // //         });
// // // // // //     };

// // // // // //     const getTodayString = () => {
// // // // // //         const today = new Date();
// // // // // //         return today.toISOString().split('T')[0];
// // // // // //     };

// // // // // //     if (isLoading) {
// // // // // //         return (
// // // // // //             <View style={styles.loadingContainer}>
// // // // // //                 <ActivityIndicator size="large" color="#4299E1" />
// // // // // //             </View>
// // // // // //         );
// // // // // //     }

// // // // // //     return (
// // // // // //         <ImageBackground
// // // // // //             source={{ uri: 'https://source.unsplash.com/random/800x600?gradient' }}
// // // // // //             resizeMode="cover"
// // // // // //             style={styles.backgroundImage}
// // // // // //         >
// // // // // //             <StatusBar style="light" />
// // // // // //             <SafeAreaView style={styles.container}>
// // // // // //                 <ScrollView 
// // // // // //                     contentContainerStyle={styles.scrollContainer}
// // // // // //                     showsVerticalScrollIndicator={false}
// // // // // //                 >
// // // // // //                     <Animated.View style={[
// // // // // //                         styles.content,
// // // // // //                         {
// // // // // //                             opacity: fadeAnim,
// // // // // //                             transform: [{ scale: scaleAnim }]
// // // // // //                         }
// // // // // //                     ]}>
// // // // // //                         <View style={styles.headerContainer}>
// // // // // //                             <BlurView intensity={80} style={styles.headerBlur}>
// // // // // //                                 <Feather name="calendar" size={24} color="#fff" />
// // // // // //                                 <Text style={styles.headerText}>Schedule Appointment</Text>
// // // // // //                             </BlurView>
// // // // // //                         </View>

// // // // // //                         <View style={styles.calendarContainer}>
// // // // // //                             <Calendar
// // // // // //                                 style={styles.calendar}
// // // // // //                                 onDayPress={handleDatePress}
// // // // // //                                 minDate={getTodayString()}
// // // // // //                                 theme={{
// // // // // //                                     backgroundColor: 'transparent',
// // // // // //                                     calendarBackground: 'rgba(255,255,255,0.98)',
// // // // // //                                     textSectionTitleColor: '#2D3748',
// // // // // //                                     selectedDayBackgroundColor: '#4299E1',
// // // // // //                                     selectedDayTextColor: '#ffffff',
// // // // // //                                     todayTextColor: '#4299E1',
// // // // // //                                     dayTextColor: '#2D3748',
// // // // // //                                     textDisabledColor: '#CBD5E0',
// // // // // //                                     arrowColor: '#4299E1',
// // // // // //                                     monthTextColor: '#2D3748',
// // // // // //                                     textDayFontFamily: 'System',
// // // // // //                                     textMonthFontFamily: 'System',
// // // // // //                                     textDayHeaderFontFamily: 'System',
// // // // // //                                     textDayFontWeight: '500',
// // // // // //                                     textMonthFontWeight: 'bold',
// // // // // //                                     textDayHeaderFontWeight: '600',
// // // // // //                                 }}
// // // // // //                                 markingType={'custom'}
// // // // // //                                 markedDates={
// // // // // //                                     selectedDate ? {
// // // // // //                                         [selectedDate.dateString]: {
// // // // // //                                             customStyles: {
// // // // // //                                                 container: styles.selectedDateContainer,
// // // // // //                                                 text: styles.selectedDateText,
// // // // // //                                             },
// // // // // //                                         },
// // // // // //                                     } : {}
// // // // // //                                 }
// // // // // //                             />
// // // // // //                         </View>

// // // // // //                         {selectedDate && (
// // // // // //                             <Animated.View 
// // // // // //                                 style={[
// // // // // //                                     styles.timeSlotsContainer,
// // // // // //                                     { opacity: fadeAnim }
// // // // // //                                 ]}
// // // // // //                             >
// // // // // //                                 <Text style={styles.timeSlotsTitle}>
// // // // // //                                     Available Times for{' '}
// // // // // //                                     <Text style={styles.selectedDateLabel}>
// // // // // //                                         {new Date(selectedDate.dateString).toLocaleDateString('en-US', {
// // // // // //                                             weekday: 'long',
// // // // // //                                             month: 'long',
// // // // // //                                             day: 'numeric'
// // // // // //                                         })}
// // // // // //                                     </Text>
// // // // // //                                 </Text>
// // // // // //                                 <FlatList
// // // // // //                                     data={timeSlots}
// // // // // //                                     keyExtractor={(item) => item.time}
// // // // // //                                     showsVerticalScrollIndicator={false}
// // // // // //                                     renderItem={({ item, index }) => (
// // // // // //                                         <TouchableOpacity
// // // // // //                                             style={[
// // // // // //                                                 styles.timeSlot,
// // // // // //                                                 item.selected && styles.timeSlotSelected,
// // // // // //                                             ]}
// // // // // //                                             onPress={() => handleTimeSlotPress(index)}
// // // // // //                                             activeOpacity={0.7}
// // // // // //                                         >
// // // // // //                                             <Feather 
// // // // // //                                                 name={item.selected ? "check-circle" : "clock"} 
// // // // // //                                                 size={20} 
// // // // // //                                                 color={item.selected ? "#fff" : "#4299E1"} 
// // // // // //                                             />
// // // // // //                                             <Text
// // // // // //                                                 style={[
// // // // // //                                                     styles.timeSlotText,
// // // // // //                                                     item.selected && styles.timeSlotTextSelected,
// // // // // //                                                 ]}
// // // // // //                                             >
// // // // // //                                                 {item.time}
// // // // // //                                             </Text>
// // // // // //                                         </TouchableOpacity>
// // // // // //                                     )}
// // // // // //                                 />
// // // // // //                             </Animated.View>
// // // // // //                         )}

// // // // // //                         <TouchableOpacity 
// // // // // //                             style={[
// // // // // //                                 styles.continueButton,
// // // // // //                                 (!selectedDate || !timeSlots.some(slot => slot.selected)) && 
// // // // // //                                 styles.continueButtonDisabled
// // // // // //                             ]}
// // // // // //                             onPress={handleContinuePress}
// // // // // //                             activeOpacity={0.8}
// // // // // //                             disabled={!selectedDate || !timeSlots.some(slot => slot.selected)}
// // // // // //                         >
// // // // // //                             <Text style={styles.continueButtonText}>Continue</Text>
// // // // // //                             <Feather name="arrow-right" size={20} color="#fff" />
// // // // // //                         </TouchableOpacity>
// // // // // //                     </Animated.View>
// // // // // //                 </ScrollView>
// // // // // //             </SafeAreaView>
// // // // // //         </ImageBackground>
// // // // // //     );
// // // // // // };

// // // // // // const styles = StyleSheet.create({
// // // // // //     backgroundImage: {
// // // // // //         flex: 1,
// // // // // //         backgroundColor: '#1A202C',
// // // // // //     },
// // // // // //     container: {
// // // // // //         flex: 1,
// // // // // //         backgroundColor: 'rgba(26, 32, 44, 0.92)',
// // // // // //     },
// // // // // //     loadingContainer: {
// // // // // //         flex: 1,
// // // // // //         justifyContent: 'center',
// // // // // //         alignItems: 'center',
// // // // // //         backgroundColor: '#1A202C',
// // // // // //     },
// // // // // //     scrollContainer: {
// // // // // //         padding: 16,
// // // // // //         paddingBottom: 32,
// // // // // //     },
// // // // // //     content: {
// // // // // //         gap: 24,
// // // // // //     },
// // // // // //     headerContainer: {
// // // // // //         alignItems: 'center',
// // // // // //         marginBottom: 8,
// // // // // //     },
// // // // // //     headerBlur: {
// // // // // //         flexDirection: 'row',
// // // // // //         alignItems: 'center',
// // // // // //         justifyContent: 'center',
// // // // // //         padding: 16,
// // // // // //         borderRadius: 16,
// // // // // //         gap: 12,
// // // // // //         width: width - 32,
// // // // // //     },
// // // // // //     headerText: {
// // // // // //         fontSize: 24,
// // // // // //         color: '#fff',
// // // // // //         fontWeight: 'bold',
// // // // // //         letterSpacing: 0.5,
// // // // // //     },
// // // // // //     calendarContainer: {
// // // // // //         borderRadius: 16,
// // // // // //         overflow: 'hidden',
// // // // // //         elevation: 4,
// // // // // //         shadowColor: '#000',
// // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // //         shadowOpacity: 0.25,
// // // // // //         shadowRadius: 3.84,
// // // // // //         backgroundColor: 'white',
// // // // // //     },
// // // // // //     calendar: {
// // // // // //         borderRadius: 16,
// // // // // //     },
// // // // // //     selectedDateContainer: {
// // // // // //         backgroundColor: '#4299E1',
// // // // // //         borderRadius: 8,
// // // // // //     },
// // // // // //     selectedDateText: {
// // // // // //         color: '#fff',
// // // // // //         fontWeight: 'bold',
// // // // // //     },
// // // // // //     selectedDateLabel: {
// // // // // //         color: '#4299E1',
// // // // // //         fontWeight: 'bold',
// // // // // //     },
// // // // // //     timeSlotsContainer: {
// // // // // //         padding: 20,
// // // // // //         backgroundColor: 'rgba(255, 255, 255, 0.98)',
// // // // // //         borderRadius: 16,
// // // // // //         elevation: 4,
// // // // // //         shadowColor: '#000',
// // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // //         shadowOpacity: 0.25,
// // // // // //         shadowRadius: 3.84,
// // // // // //     },
// // // // // //     timeSlotsTitle: {
// // // // // //         fontSize: 18,
// // // // // //         color: '#2D3748',
// // // // // //         marginBottom: 16,
// // // // // //         fontWeight: '600',
// // // // // //     },
// // // // // //     timeSlot: {
// // // // // //         flexDirection: 'row',
// // // // // //         alignItems: 'center',
// // // // // //         padding: 16,
// // // // // //         marginBottom: 8,
// // // // // //         borderRadius: 12,
// // // // // //         backgroundColor: '#EDF2F7',
// // // // // //         borderWidth: 1,
// // // // // //         borderColor: '#E2E8F0',
// // // // // //         gap: 12,
// // // // // //         elevation: 2,
// // // // // //         shadowColor: '#000',
// // // // // //         shadowOffset: { width: 0, height: 1 },
// // // // // //         shadowOpacity: 0.1,
// // // // // //         shadowRadius: 2,
// // // // // //     },
// // // // // //     timeSlotSelected: {
// // // // // //         backgroundColor: '#4299E1',
// // // // // //         borderColor: '#4299E1',
// // // // // //         elevation: 4,
// // // // // //         shadowOpacity: 0.2,
// // // // // //     },
// // // // // //     timeSlotText: {
// // // // // //         fontSize: 16,
// // // // // //         color: '#2D3748',
// // // // // //         fontWeight: '500',
// // // // // //         flex: 1,
// // // // // //     },
// // // // // //     timeSlotTextSelected: {
// // // // // //         color: '#fff',
// // // // // //         fontWeight: 'bold',
// // // // // //     },
// // // // // //     continueButton: {
// // // // // //         flexDirection: 'row',
// // // // // //         backgroundColor: '#4299E1',
// // // // // //         padding: 16,
// // // // // //         borderRadius: 12,
// // // // // //         alignItems: 'center',
// // // // // //         justifyContent: 'center',
// // // // // //         gap: 8,
// // // // // //         elevation: 4,
// // // // // //         shadowColor: '#000',
// // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // //         shadowOpacity: 0.25,
// // // // // //         shadowRadius: 3.84,
// // // // // //     },
// // // // // // // continue from where you left off in styles
// // // // // // continueButtonDisabled: {
// // // // // //     backgroundColor: '#A0AEC0', // A lighter shade to indicate disabled state
// // // // // //     shadowOpacity: 0, // No shadow for disabled button
// // // // // // },
// // // // // // continueButtonText: {
// // // // // //     color: '#fff',
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: '600',
// // // // // // },
// // // // // // });

// // // // // // export default MyCalendar;




// // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ImageBackground, ScrollView, Animated } from 'react-native';
// // // // // // // import { Calendar, DateObject } from 'react-native-calendars';
// // // // // // // import { useRouter } from 'expo-router';
// // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // import { StatusBar } from 'expo-status-bar';
// // // // // // // import { Feather } from '@expo/vector-icons';

// // // // // // // type TimeSlot = {
// // // // // // //     time: string;
// // // // // // //     selected: boolean;
// // // // // // // };

// // // // // // // const availableTimeSlots: TimeSlot[] = [
// // // // // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // // // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // // // // //     { time: '11:00 AM - 12:00 PM', selected: false },
// // // // // // //     { time: '12:00 PM - 1:00 PM', selected: false },
// // // // // // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // // // // // //     { time: '2:00 PM - 3:00 PM', selected: false },
// // // // // // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // // // // //     { time: '4:00 PM - 5:00 PM', selected: false },
// // // // // // //     { time: '5:00 PM - 6:00 PM', selected: false },
// // // // // // // ];

// // // // // // // const MyCalendar: React.FC = () => {
// // // // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // // // //     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);
// // // // // // //     const [fadeAnim] = useState(new Animated.Value(0));
// // // // // // //     const router = useRouter();

// // // // // // //     useEffect(() => {
// // // // // // //         Animated.timing(fadeAnim, {
// // // // // // //             toValue: 1,
// // // // // // //             duration: 1000,
// // // // // // //             useNativeDriver: true,
// // // // // // //         }).start();
// // // // // // //     }, []);

// // // // // // //     const handleDatePress = (date: DateObject) => {
// // // // // // //         setSelectedDate(date);
// // // // // // //         setTimeSlots(availableTimeSlots);
// // // // // // //         Animated.sequence([
// // // // // // //             Animated.timing(fadeAnim, {
// // // // // // //                 toValue: 0,
// // // // // // //                 duration: 200,
// // // // // // //                 useNativeDriver: true,
// // // // // // //             }),
// // // // // // //             Animated.timing(fadeAnim, {
// // // // // // //                 toValue: 1,
// // // // // // //                 duration: 500,
// // // // // // //                 useNativeDriver: true,
// // // // // // //             }),
// // // // // // //         ]).start();
// // // // // // //     };

// // // // // // //     const handleTimeSlotPress = (index: number) => {
// // // // // // //         const updatedTimeSlots = timeSlots.map((slot, idx) => ({
// // // // // // //             ...slot,
// // // // // // //             selected: idx === index ? !slot.selected : false,
// // // // // // //         }));
// // // // // // //         setTimeSlots(updatedTimeSlots);
// // // // // // //     };

// // // // // // //     const handleContinuePress = () => {
// // // // // // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // // // // // //             Alert.alert(
// // // // // // //                 'Incomplete Selection',
// // // // // // //                 'Please select both a date and a time slot to continue.',
// // // // // // //                 [{ text: 'OK', style: 'default' }],
// // // // // // //                 { cancelable: true }
// // // // // // //             );
// // // // // // //             return;
// // // // // // //         }
// // // // // // //         router.push('/(authenticated)/(tabs)/CheckList');
// // // // // // //     };

// // // // // // //     const getTodayString = () => {
// // // // // // //         const today = new Date();
// // // // // // //         return today.toISOString().split('T')[0];
// // // // // // //     };

// // // // // // //     return (
// // // // // // //         <ImageBackground
// // // // // // //             source={{ uri: 'https://source.unsplash.com/random/800x600?gradient' }}
// // // // // // //             resizeMode="cover"
// // // // // // //             style={styles.backgroundImage}
// // // // // // //         >
// // // // // // //             <StatusBar style="light" />
// // // // // // //             <SafeAreaView style={styles.container}>
// // // // // // //                 <ScrollView 
// // // // // // //                     contentContainerStyle={styles.scrollContainer}
// // // // // // //                     showsVerticalScrollIndicator={false}
// // // // // // //                 >
// // // // // // //                     <View style={styles.headerContainer}>
// // // // // // //                         <Feather name="calendar" size={24} color="#fff" />
// // // // // // //                         <Text style={styles.headerText}>Schedule Appointment</Text>
// // // // // // //                     </View>

// // // // // // //                     <View style={styles.calendarContainer}>
// // // // // // //                         <Calendar
// // // // // // //                             style={styles.calendar}
// // // // // // //                             onDayPress={handleDatePress}
// // // // // // //                             minDate={getTodayString()}
// // // // // // //                             theme={{
// // // // // // //                                 backgroundColor: 'transparent',
// // // // // // //                                 calendarBackground: 'rgba(255,255,255,0.95)',
// // // // // // //                                 textSectionTitleColor: '#2D3748',
// // // // // // //                                 selectedDayBackgroundColor: '#4299E1',
// // // // // // //                                 selectedDayTextColor: '#ffffff',
// // // // // // //                                 todayTextColor: '#4299E1',
// // // // // // //                                 dayTextColor: '#2D3748',
// // // // // // //                                 textDisabledColor: '#CBD5E0',
// // // // // // //                                 arrowColor: '#4299E1',
// // // // // // //                                 monthTextColor: '#2D3748',
// // // // // // //                                 textDayFontWeight: '500',
// // // // // // //                                 textMonthFontWeight: 'bold',
// // // // // // //                                 textDayHeaderFontWeight: '600',
// // // // // // //                             }}
// // // // // // //                             markingType={'custom'}
// // // // // // //                             markedDates={
// // // // // // //                                 selectedDate ? {
// // // // // // //                                     [selectedDate.dateString]: {
// // // // // // //                                         customStyles: {
// // // // // // //                                             container: styles.selectedDateContainer,
// // // // // // //                                             text: styles.selectedDateText,
// // // // // // //                                         },
// // // // // // //                                     },
// // // // // // //                                 } : {}
// // // // // // //                             }
// // // // // // //                         />
// // // // // // //                     </View>

// // // // // // //                     {selectedDate && (
// // // // // // //                         <Animated.View 
// // // // // // //                             style={[
// // // // // // //                                 styles.timeSlotsContainer,
// // // // // // //                                 { opacity: fadeAnim }
// // // // // // //                             ]}
// // // // // // //                         >
// // // // // // //                             <Text style={styles.timeSlotsTitle}>
// // // // // // //                                 Available Times for {new Date(selectedDate.dateString).toLocaleDateString('en-US', {
// // // // // // //                                     weekday: 'long',
// // // // // // //                                     month: 'long',
// // // // // // //                                     day: 'numeric'
// // // // // // //                                 })}
// // // // // // //                             </Text>
// // // // // // //                             <FlatList
// // // // // // //                                 data={timeSlots}
// // // // // // //                                 keyExtractor={(item) => item.time}
// // // // // // //                                 showsVerticalScrollIndicator={false}
// // // // // // //                                 renderItem={({ item, index }) => (
// // // // // // //                                     <TouchableOpacity
// // // // // // //                                         style={[
// // // // // // //                                             styles.timeSlot,
// // // // // // //                                             item.selected && styles.timeSlotSelected,
// // // // // // //                                         ]}
// // // // // // //                                         onPress={() => handleTimeSlotPress(index)}
// // // // // // //                                         activeOpacity={0.7}
// // // // // // //                                     >
// // // // // // //                                         <Feather 
// // // // // // //                                             name={item.selected ? "check-circle" : "clock"} 
// // // // // // //                                             size={20} 
// // // // // // //                                             color={item.selected ? "#fff" : "#4299E1"} 
// // // // // // //                                         />
// // // // // // //                                         <Text
// // // // // // //                                             style={[
// // // // // // //                                                 styles.timeSlotText,
// // // // // // //                                                 item.selected && styles.timeSlotTextSelected,
// // // // // // //                                             ]}
// // // // // // //                                         >
// // // // // // //                                             {item.time}
// // // // // // //                                         </Text>
// // // // // // //                                     </TouchableOpacity>
// // // // // // //                                 )}
// // // // // // //                             />
// // // // // // //                         </Animated.View>
// // // // // // //                     )}

// // // // // // //                     <TouchableOpacity 
// // // // // // //                         style={[
// // // // // // //                             styles.continueButton,
// // // // // // //                             (!selectedDate || !timeSlots.some(slot => slot.selected)) && 
// // // // // // //                             styles.continueButtonDisabled
// // // // // // //                         ]}
// // // // // // //                         onPress={handleContinuePress}
// // // // // // //                         activeOpacity={0.8}
// // // // // // //                     >
// // // // // // //                         <Text style={styles.continueButtonText}>Continue</Text>
// // // // // // //                         <Feather name="arrow-right" size={20} color="#fff" />
// // // // // // //                     </TouchableOpacity>
// // // // // // //                 </ScrollView>
// // // // // // //             </SafeAreaView>
// // // // // // //         </ImageBackground>
// // // // // // //     );
// // // // // // // };

// // // // // // // const styles = StyleSheet.create({
// // // // // // //     backgroundImage: {
// // // // // // //         flex: 1,
// // // // // // //         backgroundColor: '#1A202C',
// // // // // // //     },
// // // // // // //     container: {
// // // // // // //         flex: 1,
// // // // // // //         backgroundColor: 'rgba(26, 32, 44, 0.95)',
// // // // // // //     },
// // // // // // //     scrollContainer: {
// // // // // // //         padding: 20,
// // // // // // //     },
// // // // // // //     headerContainer: {
// // // // // // //         flexDirection: 'row',
// // // // // // //         alignItems: 'center',
// // // // // // //         justifyContent: 'center',
// // // // // // //         marginBottom: 24,
// // // // // // //         gap: 12,
// // // // // // //     },
// // // // // // //     headerText: {
// // // // // // //         fontSize: 24,
// // // // // // //         color: '#fff',
// // // // // // //         fontWeight: 'bold',
// // // // // // //     },
// // // // // // //     calendarContainer: {
// // // // // // //         borderRadius: 16,
// // // // // // //         overflow: 'hidden',
// // // // // // //         elevation: 4,
// // // // // // //         shadowColor: '#000',
// // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // //         shadowOpacity: 0.25,
// // // // // // //         shadowRadius: 3.84,
// // // // // // //     },
// // // // // // //     calendar: {
// // // // // // //         borderRadius: 16,
// // // // // // //     },
// // // // // // //     selectedDateContainer: {
// // // // // // //         backgroundColor: '#4299E1',
// // // // // // //         borderRadius: 8,
// // // // // // //     },
// // // // // // //     selectedDateText: {
// // // // // // //         color: '#fff',
// // // // // // //         fontWeight: 'bold',
// // // // // // //     },
// // // // // // //     timeSlotsContainer: {
// // // // // // //         marginTop: 24,
// // // // // // //         padding: 20,
// // // // // // //         backgroundColor: 'rgba(255, 255, 255, 0.95)',
// // // // // // //         borderRadius: 16,
// // // // // // //         elevation: 4,
// // // // // // //         shadowColor: '#000',
// // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // //         shadowOpacity: 0.25,
// // // // // // //         shadowRadius: 3.84,
// // // // // // //     },
// // // // // // //     timeSlotsTitle: {
// // // // // // //         fontSize: 18,
// // // // // // //         color: '#2D3748',
// // // // // // //         marginBottom: 16,
// // // // // // //         fontWeight: 'bold',
// // // // // // //     },
// // // // // // //     timeSlot: {
// // // // // // //         flexDirection: 'row',
// // // // // // //         alignItems: 'center',
// // // // // // //         padding: 16,
// // // // // // //         marginBottom: 8,
// // // // // // //         borderRadius: 12,
// // // // // // //         backgroundColor: '#EDF2F7',
// // // // // // //         borderWidth: 1,
// // // // // // //         borderColor: '#E2E8F0',
// // // // // // //         gap: 12,
// // // // // // //     },
// // // // // // //     timeSlotSelected: {
// // // // // // //         backgroundColor: '#4299E1',
// // // // // // //         borderColor: '#4299E1',
// // // // // // //     },
// // // // // // //     timeSlotText: {
// // // // // // //         fontSize: 16,
// // // // // // //         color: '#2D3748',
// // // // // // //         fontWeight: '500',
// // // // // // //     },
// // // // // // //     timeSlotTextSelected: {
// // // // // // //         color: '#fff',
// // // // // // //         fontWeight: 'bold',
// // // // // // //     },
// // // // // // //     continueButton: {
// // // // // // //         flexDirection: 'row',
// // // // // // //         backgroundColor: '#4299E1',
// // // // // // //         padding: 16,
// // // // // // //         borderRadius: 12,
// // // // // // //         alignItems: 'center',
// // // // // // //         justifyContent: 'center',
// // // // // // //         marginTop: 24,
// // // // // // //         gap: 8,
// // // // // // //         elevation: 4,
// // // // // // //         shadowColor: '#000',
// // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // //         shadowOpacity: 0.25,
// // // // // // //         shadowRadius: 3.84,
// // // // // // //     },
// // // // // // //     continueButtonDisabled: {
// // // // // // //         backgroundColor: '#A0AEC0',
// // // // // // //         elevation: 0,
// // // // // // //         shadowOpacity: 0,
// // // // // // //     },
// // // // // // //     continueButtonText: {
// // // // // // //         fontSize: 18,
// // // // // // //         color: '#fff',
// // // // // // //         fontWeight: 'bold',
// // // // // // //     },
// // // // // // // });

// // // // // // // export default MyCalendar;



// // // // // // // // import React, { useState } from 'react';
// // // // // // // // import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ImageBackground, ScrollView } from 'react-native';
// // // // // // // // import { Calendar, DateObject } from 'react-native-calendars';
// // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // import { StatusBar } from 'expo-status-bar';

// // // // // // // // type TimeSlot = {
// // // // // // // //     time: string;
// // // // // // // //     selected: boolean;
// // // // // // // // };

// // // // // // // // const availableTimeSlots: TimeSlot[] = [
// // // // // // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // // // // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // // // // // //     { time: '11:00 AM - 12:00 PM', selected: false },
// // // // // // // //     { time: '12:00 PM - 1:00 PM', selected: false },
// // // // // // // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // // // // // // //     { time: '2:00 PM - 3:00 PM', selected: false },
// // // // // // // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // // // // // //     { time: '4:00 PM - 5:00 PM', selected: false },
// // // // // // // //     { time: '5:00 PM - 6:00 PM', selected: false },
// // // // // // // // ];

// // // // // // // // const MyCalendar: React.FC = () => {
// // // // // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // // // // //     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);
// // // // // // // //     const router = useRouter();

// // // // // // // //     const handleDatePress = (date: DateObject) => {
// // // // // // // //         setSelectedDate(date);
// // // // // // // //         setTimeSlots(availableTimeSlots);
// // // // // // // //     };

// // // // // // // //     const handleTimeSlotPress = (index: number) => {
// // // // // // // //         const updatedTimeSlots = [...timeSlots];
// // // // // // // //         updatedTimeSlots[index].selected = !updatedTimeSlots[index].selected;
// // // // // // // //         setTimeSlots(updatedTimeSlots);
// // // // // // // //     };

// // // // // // // //     const handleContinuePress = () => {
// // // // // // // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // // // // // // //             Alert.alert('Error', 'Please select both a date and a time slot.');
// // // // // // // //             return;
// // // // // // // //         }
// // // // // // // //         router.push('CheckList');
// // // // // // // //     };

// // // // // // // //     return (
// // // // // // // //         <ImageBackground
// // // // // // // //             source={{ uri: 'https://source.unsplash.com/random/800x600?landscape' }}
// // // // // // // //             resizeMode="cover"
// // // // // // // //             style={styles.backgroundImage}
// // // // // // // //         >
// // // // // // // //             <StatusBar style="light" />
// // // // // // // //             <SafeAreaView style={styles.container}>
// // // // // // // //                 <ScrollView contentContainerStyle={styles.scrollContainer}>
// // // // // // // //                     <Text style={styles.headerText}>Pick a Date & Time</Text>
// // // // // // // //                     <Calendar
// // // // // // // //                         style={styles.calendar}
// // // // // // // //                         onDayPress={handleDatePress}
// // // // // // // //                         theme={{
// // // // // // // //                             backgroundColor: 'rgba(0,0,0,0.6)',
// // // // // // // //                             calendarBackground: 'rgba(0,0,0,0.4)',
// // // // // // // //                             textSectionTitleColor: '#F39C12', // Updated color
// // // // // // // //                             dayTextColor: '#ffffff',
// // // // // // // //                             todayTextColor: '#F39C12', // Updated color
// // // // // // // //                             arrowColor: '#F39C12', // Updated color
// // // // // // // //                             monthTextColor: '#F39C12', // Updated color
// // // // // // // //                         }}
// // // // // // // //                         markingType={'custom'}
// // // // // // // //                         markedDates={selectedDate ? {
// // // // // // // //                             [selectedDate.dateString]: {
// // // // // // // //                                 customStyles: {
// // // // // // // //                                     container: {
// // // // // // // //                                         backgroundColor: '#F39C12', // Updated color
// // // // // // // //                                         borderRadius: 8,
// // // // // // // //                                     },
// // // // // // // //                                     text: {
// // // // // // // //                                         color: '#fff',
// // // // // // // //                                     },
// // // // // // // //                                 },
// // // // // // // //                             },
// // // // // // // //                         } : {}}
// // // // // // // //                     />
// // // // // // // //                     {selectedDate && (
// // // // // // // //                         <View style={styles.timeSlotsContainer}>
// // // // // // // //                             <Text style={styles.timeSlotsTitle}>Time Slots for {selectedDate.dateString}</Text>
// // // // // // // //                             <FlatList
// // // // // // // //                                 data={timeSlots}
// // // // // // // //                                 keyExtractor={(item) => item.time}
// // // // // // // //                                 renderItem={({ item, index }) => (
// // // // // // // //                                     <TouchableOpacity
// // // // // // // //                                         style={[
// // // // // // // //                                             styles.timeSlot,
// // // // // // // //                                             item.selected && styles.timeSlotSelected,
// // // // // // // //                                         ]}
// // // // // // // //                                         onPress={() => handleTimeSlotPress(index)}
// // // // // // // //                                     >
// // // // // // // //                                         <Text
// // // // // // // //                                             style={[
// // // // // // // //                                                 styles.timeSlotText,
// // // // // // // //                                                 item.selected && styles.timeSlotTextSelected,
// // // // // // // //                                             ]}
// // // // // // // //                                         >
// // // // // // // //                                             {item.time}
// // // // // // // //                                         </Text>
// // // // // // // //                                     </TouchableOpacity>
// // // // // // // //                                 )}
// // // // // // // //                             />
// // // // // // // //                         </View>
// // // // // // // //                     )}
// // // // // // // //                     <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
// // // // // // // //                         <Text style={styles.continueButtonText}>Continue</Text>
// // // // // // // //                     </TouchableOpacity>
// // // // // // // //                 </ScrollView>
// // // // // // // //             </SafeAreaView>
// // // // // // // //         </ImageBackground>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //     backgroundImage: {
// // // // // // // //         flex: 1,
// // // // // // // //     },
// // // // // // // //     container: {
// // // // // // // //         flex: 1,
// // // // // // // //         backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // // // // // // //     },
// // // // // // // //     scrollContainer: {
// // // // // // // //         padding: 20,
// // // // // // // //     },
// // // // // // // //     headerText: {
// // // // // // // //         fontSize: 24,
// // // // // // // //         color: '#fff',
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //         textAlign: 'center',
// // // // // // // //         marginBottom: 20,
// // // // // // // //     },
// // // // // // // //     calendar: {
// // // // // // // //         borderRadius: 10,
// // // // // // // //         overflow: 'hidden',
// // // // // // // //         marginBottom: 20,
// // // // // // // //     },
// // // // // // // //     timeSlotsContainer: {
// // // // // // // //         flex: 1,
// // // // // // // //         padding: 15,
// // // // // // // //         backgroundColor: 'rgba(255, 255, 255, 0.2)',
// // // // // // // //         borderRadius: 10,
// // // // // // // //     },
// // // // // // // //     timeSlotsTitle: {
// // // // // // // //         fontSize: 18,
// // // // // // // //         color: '#F39C12', // Updated color
// // // // // // // //         marginBottom: 10,
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //     },
// // // // // // // //     timeSlot: {
// // // // // // // //         padding: 15,
// // // // // // // //         marginBottom: 10,
// // // // // // // //         borderRadius: 10,
// // // // // // // //         backgroundColor: 'rgba(255, 255, 255, 0.2)',
// // // // // // // //     },
// // // // // // // //     timeSlotSelected: {
// // // // // // // //         backgroundColor: '#F39C12', // Updated color
// // // // // // // //     },
// // // // // // // //     timeSlotText: {
// // // // // // // //         fontSize: 16,
// // // // // // // //         color: '#ffffff',
// // // // // // // //     },
// // // // // // // //     timeSlotTextSelected: {
// // // // // // // //         color: '#fff',
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //     },
// // // // // // // //     continueButton: {
// // // // // // // //         backgroundColor: '#F39C12', // Updated color
// // // // // // // //         padding: 15,
// // // // // // // //         borderRadius: 30,
// // // // // // // //         alignItems: 'center',
// // // // // // // //         marginTop: 20,
// // // // // // // //     },
// // // // // // // //     continueButtonText: {
// // // // // // // //         fontSize: 18,
// // // // // // // //         color: '#fff',
// // // // // // // //         fontWeight: 'bold',
// // // // // // // //     },
// // // // // // // // });

// // // // // // // // export default MyCalendar;




// // // // // // // // // import React, { useState } from 'react';
// // // // // // // // // import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
// // // // // // // // // import { Calendar, DateObject } from 'react-native-calendars';
// // // // // // // // // import { useNavigation } from '@react-navigation/native';
// // // // // // // // // import { useRouter } from 'expo-router';
// // // // // // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // // // // // import { StatusBar } from 'expo-status-bar';

// // // // // // // // // type TimeSlot = {
// // // // // // // // //     time: string;
// // // // // // // // //     selected: boolean;
// // // // // // // // // };

// // // // // // // // // const availableTimeSlots: TimeSlot[] = [
// // // // // // // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // // // // // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // // // // // // //     { time: '11:00 AM - 12:00 PM', selected: false },
// // // // // // // // //     { time: '12:00 PM - 1:00 PM', selected: false },
// // // // // // // // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // // // // // // // //     { time: '2:00 PM - 3:00 PM', selected: false },
// // // // // // // // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // // // // // // //     { time: '4:00 PM - 5:00 PM', selected: false },
// // // // // // // // //     { time: '5:00 PM - 6:00 PM', selected: false },
// // // // // // // // // ];

// // // // // // // // // const MyCalendar: React.FC = () => {
// // // // // // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // // // // // //     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);
// // // // // // // // //     // const navigation = useNavigation();
// // // // // // // // //     const router = useRouter();

// // // // // // // // //     const handleDatePress = (date: DateObject) => {
// // // // // // // // //         setSelectedDate(date);
// // // // // // // // //         setTimeSlots(availableTimeSlots);
// // // // // // // // //     };

// // // // // // // // //     const handleTimeSlotPress = (index: number) => {
// // // // // // // // //         const updatedTimeSlots = [...timeSlots];
// // // // // // // // //         updatedTimeSlots[index].selected = !updatedTimeSlots[index].selected;
// // // // // // // // //         setTimeSlots(updatedTimeSlots);
// // // // // // // // //     };

// // // // // // // // //     const handleContinuePress = () => {
// // // // // // // // //         if (!selectedDate || !timeSlots.some(slot => slot.selected)) {
// // // // // // // // //             Alert.alert('Error', 'Please select both a date and a time slot.');
// // // // // // // // //             return;
// // // // // // // // //         }
// // // // // // // // //         router.push('CheckList')
// // // // // // // // //     };

// // // // // // // // //     return (
// // // // // // // // //         <>
// // // // // // // // //             <StatusBar style="light" />
// // // // // // // // //             <SafeAreaView style={styles.container}>
// // // // // // // // //                 <Calendar
// // // // // // // // //                     style={styles.calendar}
// // // // // // // // //                     onDayPress={handleDatePress}
// // // // // // // // //                     markingType={'custom'}
// // // // // // // // //                     markedDates={selectedDate ? {
// // // // // // // // //                         [selectedDate.dateString]: {
// // // // // // // // //                             customStyles: {
// // // // // // // // //                                 container: {
// // // // // // // // //                                     backgroundColor: '#ff6f61', // Highlight color
// // // // // // // // //                                     borderRadius: 15,
// // // // // // // // //                                 },
// // // // // // // // //                                 text: {
// // // // // // // // //                                     color: '#fff',
// // // // // // // // //                                 },
// // // // // // // // //                             },
// // // // // // // // //                         },
// // // // // // // // //                     } : {}}
// // // // // // // // //                 />
// // // // // // // // //                 {selectedDate && (
// // // // // // // // //                     <View style={styles.timeSlotsContainer}>
// // // // // // // // //                         <Text style={styles.timeSlotsTitle}>Select Time Slots for {selectedDate.dateString}</Text>
// // // // // // // // //                         <FlatList
// // // // // // // // //                             data={timeSlots}
// // // // // // // // //                             keyExtractor={(item) => item.time}
// // // // // // // // //                             renderItem={({ item, index }) => (
// // // // // // // // //                                 <TouchableOpacity
// // // // // // // // //                                     style={[
// // // // // // // // //                                         styles.timeSlot,
// // // // // // // // //                                         item.selected && styles.timeSlotSelected,
// // // // // // // // //                                     ]}
// // // // // // // // //                                     onPress={() => handleTimeSlotPress(index)}
// // // // // // // // //                                 >
// // // // // // // // //                                     <Text
// // // // // // // // //                                         style={[
// // // // // // // // //                                             styles.timeSlotText,
// // // // // // // // //                                             item.selected && styles.timeSlotTextSelected,
// // // // // // // // //                                         ]}
// // // // // // // // //                                     >
// // // // // // // // //                                         {item.time}
// // // // // // // // //                                     </Text>
// // // // // // // // //                                 </TouchableOpacity>
// // // // // // // // //                             )}
// // // // // // // // //                         />
// // // // // // // // //                     </View>
// // // // // // // // //                 )}
// // // // // // // // //                 <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
// // // // // // // // //                     <Text style={styles.continueButtonText}>Continue</Text>
// // // // // // // // //                 </TouchableOpacity>
// // // // // // // // //             </SafeAreaView>
// // // // // // // // //         </>
// // // // // // // // //     );
// // // // // // // // // };

// // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // //     container: {
// // // // // // // // //         flex: 1,
// // // // // // // // //         backgroundColor: '#f0f4f8',
// // // // // // // // //     },
// // // // // // // // //     header: {
// // // // // // // // //         height: 60,
// // // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // // //         justifyContent: 'center',
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         borderBottomLeftRadius: 30,
// // // // // // // // //         borderBottomRightRadius: 30,
// // // // // // // // //         marginBottom: 10,
// // // // // // // // //     },
// // // // // // // // //     headerText: {
// // // // // // // // //         fontSize: 22,
// // // // // // // // //         color: '#fff',
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //     },
// // // // // // // // //     calendar: {
// // // // // // // // //         margin: 10,
// // // // // // // // //         borderRadius: 15,
// // // // // // // // //         overflow: 'hidden',
// // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // //         elevation: 5, // Shadow for Android
// // // // // // // // //         shadowColor: '#000', // Shadow for iOS
// // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // //         shadowRadius: 5,
// // // // // // // // //     },
// // // // // // // // //     timeSlotsContainer: {
// // // // // // // // //         flex: 1,
// // // // // // // // //         padding: 15,
// // // // // // // // //     },
// // // // // // // // //     timeSlotsTitle: {
// // // // // // // // //         fontSize: 18,
// // // // // // // // //         color: '#333',
// // // // // // // // //         marginBottom: 10,
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //     },
// // // // // // // // //     timeSlot: {
// // // // // // // // //         padding: 15,
// // // // // // // // //         marginBottom: 10,
// // // // // // // // //         borderRadius: 10,
// // // // // // // // //         borderWidth: 1,
// // // // // // // // //         borderColor: '#ddd',
// // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // //     },
// // // // // // // // //     timeSlotSelected: {
// // // // // // // // //         backgroundColor: '#4caf50',
// // // // // // // // //         borderColor: '#4caf50',
// // // // // // // // //     },
// // // // // // // // //     timeSlotText: {
// // // // // // // // //         fontSize: 16,
// // // // // // // // //         color: '#333',
// // // // // // // // //     },
// // // // // // // // //     timeSlotTextSelected: {
// // // // // // // // //         color: '#fff',
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //     },
// // // // // // // // //     continueButton: {
// // // // // // // // //         backgroundColor: '#ff6f61',
// // // // // // // // //         padding: 15,
// // // // // // // // //         borderRadius: 30,
// // // // // // // // //         margin: 15,
// // // // // // // // //         alignItems: 'center',
// // // // // // // // //         elevation: 5, // Shadow for Android
// // // // // // // // //         shadowColor: '#000', // Shadow for iOS
// // // // // // // // //         shadowOffset: { width: 0, height: 4 },
// // // // // // // // //         shadowOpacity: 0.2,
// // // // // // // // //         shadowRadius: 6,
// // // // // // // // //     },
// // // // // // // // //     continueButtonText: {
// // // // // // // // //         fontSize: 18,
// // // // // // // // //         color: '#fff',
// // // // // // // // //         fontWeight: 'bold',
// // // // // // // // //     },
// // // // // // // // // });

// // // // // // // // // export default MyCalendar;


// // // // // // // // // // import React, { useState } from 'react';
// // // // // // // // // // import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
// // // // // // // // // // import { Calendar, DateObject } from 'react-native-calendars';
// // // // // // // // // // import { ScrollView } from 'react-native-gesture-handler';

// // // // // // // // // // type TimeSlot = {
// // // // // // // // // //     time: string;
// // // // // // // // // //     selected: boolean;
// // // // // // // // // // };

// // // // // // // // // // const availableTimeSlots: TimeSlot[] = [
// // // // // // // // // //     { time: '9:00 AM - 10:00 AM', selected: false },
// // // // // // // // // //     { time: '10:00 AM - 11:00 AM', selected: false },
// // // // // // // // // //     { time: '11:00 AM - 12:00 PM', selected: false },
// // // // // // // // // //     { time: '12:00 PM - 1:00 PM', selected: false },
// // // // // // // // // //     { time: '1:00 PM - 2:00 PM', selected: false },
// // // // // // // // // //     { time: '2:00 PM - 3:00 PM', selected: false },
// // // // // // // // // //     { time: '3:00 PM - 4:00 PM', selected: false },
// // // // // // // // // //     { time: '4:00 PM - 5:00 PM', selected: false },
// // // // // // // // // //     { time: '5:00 PM - 6:00 PM', selected: false },
// // // // // // // // // // ];

// // // // // // // // // // const MyCalendar: React.FC = () => {
// // // // // // // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // // // // // // //     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(availableTimeSlots);

// // // // // // // // // //     const handleDatePress = (date: DateObject) => {
// // // // // // // // // //         setSelectedDate(date);
// // // // // // // // // //         setTimeSlots(availableTimeSlots);
// // // // // // // // // //     };

// // // // // // // // // //     const handleTimeSlotPress = (index: number) => {
// // // // // // // // // //         const updatedTimeSlots = [...timeSlots];
// // // // // // // // // //         updatedTimeSlots[index].selected = !updatedTimeSlots[index].selected;
// // // // // // // // // //         setTimeSlots(updatedTimeSlots);
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <ScrollView style={styles.container}>
// // // // // // // // // //             <Calendar
// // // // // // // // // //                 style={styles.calendar}
// // // // // // // // // //                 onDayPress={handleDatePress}
// // // // // // // // // //                 markingType={'custom'}
// // // // // // // // // //                 markedDates={selectedDate ? {
// // // // // // // // // //                     [selectedDate.dateString]: {
// // // // // // // // // //                         customStyles: {
// // // // // // // // // //                             container: {
// // // // // // // // // //                                 backgroundColor: '#ff6f61', // Highlight color
// // // // // // // // // //                                 borderRadius: 15,
// // // // // // // // // //                             },
// // // // // // // // // //                             text: {
// // // // // // // // // //                                 color: '#fff',
// // // // // // // // // //                             },
// // // // // // // // // //                         },
// // // // // // // // // //                     },
// // // // // // // // // //                 } : {}}
// // // // // // // // // //             />
// // // // // // // // // //             {selectedDate && (
// // // // // // // // // //                 <View style={styles.timeSlotsContainer}>
// // // // // // // // // //                     <Text style={styles.timeSlotsTitle}>Select Time Slots for {selectedDate.dateString}</Text>
// // // // // // // // // //                     <FlatList
// // // // // // // // // //                         data={timeSlots}
// // // // // // // // // //                         keyExtractor={(item) => item.time}
// // // // // // // // // //                         renderItem={({ item, index }) => (
// // // // // // // // // //                             <TouchableOpacity
// // // // // // // // // //                                 style={[
// // // // // // // // // //                                     styles.timeSlot,
// // // // // // // // // //                                     item.selected && styles.timeSlotSelected,
// // // // // // // // // //                                 ]}
// // // // // // // // // //                                 onPress={() => handleTimeSlotPress(index)}
// // // // // // // // // //                             >
// // // // // // // // // //                                 <Text
// // // // // // // // // //                                     style={[
// // // // // // // // // //                                         styles.timeSlotText,
// // // // // // // // // //                                         item.selected && styles.timeSlotTextSelected,
// // // // // // // // // //                                     ]}
// // // // // // // // // //                                 >
// // // // // // // // // //                                     {item.time}
// // // // // // // // // //                                 </Text>
// // // // // // // // // //                             </TouchableOpacity>
// // // // // // // // // //                         )}
// // // // // // // // // //                     />
// // // // // // // // // //                 </View>
// // // // // // // // // //             )}
// // // // // // // // // //         </ScrollView>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // //     container: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         backgroundColor: '#f0f4f8',
// // // // // // // // // //     },
// // // // // // // // // //     header: {
// // // // // // // // // //         height: 60,
// // // // // // // // // //         backgroundColor: '#4a90e2',
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //         borderBottomLeftRadius: 30,
// // // // // // // // // //         borderBottomRightRadius: 30,
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //     },
// // // // // // // // // //     headerText: {
// // // // // // // // // //         fontSize: 22,
// // // // // // // // // //         color: '#fff',
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //     },
// // // // // // // // // //     calendar: {
// // // // // // // // // //         margin: 10,
// // // // // // // // // //         borderRadius: 15,
// // // // // // // // // //         overflow: 'hidden',
// // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // //         elevation: 5, // Shadow for Android
// // // // // // // // // //         shadowColor: '#000', // Shadow for iOS
// // // // // // // // // //         shadowOffset: { width: 0, height: 2 },
// // // // // // // // // //         shadowOpacity: 0.1,
// // // // // // // // // //         shadowRadius: 5,
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotsContainer: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //         padding: 15,
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotsTitle: {
// // // // // // // // // //         fontSize: 18,
// // // // // // // // // //         color: '#333',
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //     },
// // // // // // // // // //     timeSlot: {
// // // // // // // // // //         padding: 15,
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //         borderRadius: 10,
// // // // // // // // // //         borderWidth: 1,
// // // // // // // // // //         borderColor: '#ddd',
// // // // // // // // // //         backgroundColor: '#fff',
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotSelected: {
// // // // // // // // // //         backgroundColor: '#4caf50',
// // // // // // // // // //         borderColor: '#4caf50',
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotText: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         color: '#333',
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotTextSelected: {
// // // // // // // // // //         color: '#fff',
// // // // // // // // // //         fontWeight: 'bold',
// // // // // // // // // //     },
// // // // // // // // // // });

// // // // // // // // // // export default MyCalendar;



// // // // // // // // // // import React, { useState } from 'react';
// // // // // // // // // // import { View, Text, FlatList, StyleSheet } from 'react-native';
// // // // // // // // // // import { Calendar, DateObject } from 'react-native-calendars';

// // // // // // // // // // type TimeSlot = {
// // // // // // // // // //     time: string;
// // // // // // // // // // };

// // // // // // // // // // const MyCalendar: React.FC = () => {
// // // // // // // // // //     const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
// // // // // // // // // //     const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

// // // // // // // // // //     const handleDatePress = (date: DateObject) => {
// // // // // // // // // //         setSelectedDate(date);
// // // // // // // // // //         // Fetch time slots for the selected date from your backend or logic here
// // // // // // // // // //         setTimeSlots([
// // // // // // // // // //             { time: '9:00 AM - 10:00 AM' },
// // // // // // // // // //             { time: '10:00 AM - 11:00 AM' },
// // // // // // // // // //         ]);
// // // // // // // // // //     };

// // // // // // // // // //     return (
// // // // // // // // // //         <View style={styles.container}>
// // // // // // // // // //             <View style={styles.header}>
// // // // // // // // // //                 <Text style={styles.headerText}>Select Date</Text>
// // // // // // // // // //             </View>
// // // // // // // // // //             <Calendar onDayPress={handleDatePress} />
// // // // // // // // // //             {selectedDate && (
// // // // // // // // // //                 <View style={styles.timeSlotsContainer}>
// // // // // // // // // //                     <Text style={styles.timeSlotsTitle}>Time Slots for {selectedDate.dateString}</Text>
// // // // // // // // // //                     <FlatList
// // // // // // // // // //                         data={timeSlots}
// // // // // // // // // //                         keyExtractor={(item) => item.time}
// // // // // // // // // //                         renderItem={({ item }) => <Text style={styles.timeSlot}>{item.time}</Text>}
// // // // // // // // // //                     />
// // // // // // // // // //                 </View>
// // // // // // // // // //             )}
// // // // // // // // // //         </View>
// // // // // // // // // //     );
// // // // // // // // // // };

// // // // // // // // // // const styles = StyleSheet.create({
// // // // // // // // // //     container: {
// // // // // // // // // //         flex: 1,
// // // // // // // // // //     },
// // // // // // // // // //     header: {
// // // // // // // // // //         height: 100,
// // // // // // // // // //         backgroundColor: '#f5f5',
// // // // // // // // // //         justifyContent: 'center',
// // // // // // // // // //         alignItems: 'center',
// // // // // // // // // //     },
// // // // // // // // // //     headerText: {
// // // // // // // // // //         fontSize: 20,
// // // // // // // // // //         padding: 10,
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotsContainer: {
// // // // // // // // // //         padding: 10,
// // // // // // // // // //     },
// // // // // // // // // //     timeSlotsTitle: {
// // // // // // // // // //         fontSize: 16,
// // // // // // // // // //         marginBottom: 10,
// // // // // // // // // //     },
// // // // // // // // // //     timeSlot: {
// // // // // // // // // //         fontSize: 14,
// // // // // // // // // //     },
// // // // // // // // // // });

// // // // // // // // // // export default MyCalendar;
