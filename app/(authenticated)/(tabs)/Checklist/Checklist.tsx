import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    Animated,
    Vibration,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

type Item = {
    id: string;
    name: string;
    checked: boolean;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
};

type Category = {
    id: string;
    name: string;
    color: string;
};

const categories: Category[] = [
    { id: '1', name: 'Packing', color: '#4a90e2' },
    { id: '2', name: 'Moving', color: '#f4511e' },
    { id: '3', name: 'Cleaning', color: '#43a047' },
];

const initialItems: Item[] = [
    { id: '1', name: 'Packing Boxes', checked: false, timestamp: new Date(), priority: 'high' },
    { id: '2', name: 'Bubble Wrap', checked: false, timestamp: new Date(), priority: 'medium' },
];

const CheckList: React.FC = () => {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [newItem, setNewItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
    
    const fadeAnim = new Animated.Value(1);
    const navigation = useNavigation();
    const router = useRouter();

    const filterItems = () => items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleToggleItem = (id: string) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.4, duration: 200, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Vibration.vibrate(50);
        }

        const updatedItems = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
        setItems(updatedItems);
    };

    const handleAddItem = async () => {
        if (newItem.trim() === '') {
            Alert.alert('Error', 'Please enter an item name.');
            return;
        }

        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const newItemObj: Item = {
                id: (items.length + 1).toString(),
                name: newItem,
                checked: false,
                timestamp: new Date(),
                priority: selectedPriority,
            };

            setItems([newItemObj, ...items]);
            setNewItem('');
            Alert.alert('Success', 'Item added successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add item. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinuePress = () => {
        const uncheckedItems = items.filter(item => !item.checked);
        if (uncheckedItems.length > 0) {
            Alert.alert(
                'Uncompleted Items',
                'You still have uncompleted items. Are you sure you want to continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Continue', onPress: () => router.push('/(authenticated)/(tabs)/Payment/Payment') }
                ]
            );
        } else {
            router.push('/(authenticated)/(tabs)/Payment/Payment');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#ff6b6b';
            case 'medium': return '#ffd93d';
            case 'low': return '#6bff6b';
            default: return '#6bff6b';
        }
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Moving Checklist</Text>
            <Text style={styles.headerSubtitle}>
                {items.filter(item => item.checked).length} of {items.length} completed
            </Text>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            {renderHeader()}
            
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                { backgroundColor: item.color },
                                selectedCategory.id === item.id && styles.selectedCategory
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={styles.categoryText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.addItemContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add new item"
                    value={newItem}
                    onChangeText={setNewItem}
                />
                <View style={styles.prioritySelector}>
                    {(['low', 'medium', 'high'] as const).map((priority) => (
                        <TouchableOpacity
                            key={priority}
                            style={[
                                styles.priorityButton,
                                { backgroundColor: getPriorityColor(priority) },
                                selectedPriority === priority && styles.selectedPriority
                            ]}
                            onPress={() => setSelectedPriority(priority)}
                        >
                            <Text style={styles.priorityButtonText}>
                                {priority.charAt(0).toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={handleAddItem}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Ionicons name="add" size={24} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            <FlatList
                data={filterItems()}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <TouchableOpacity
                            style={[
                                styles.item,
                                item.checked && styles.itemChecked,
                                { borderLeftColor: getPriorityColor(item.priority) }
                            ]}
                            onPress={() => handleToggleItem(item.id)}
                        >
                            <View style={styles.itemContent}>
                                <Text style={[
                                    styles.itemText,
                                    item.checked && styles.itemTextChecked
                                ]}>
                                    {item.name}
                                </Text>
                                <Text style={styles.timestamp}>
                                    {new Date(item.timestamp).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </Text>
                            </View>
                            {item.checked ? (
                                <MaterialIcons name="check-circle" size={24} color="#4caf50" />
                            ) : (
                                <FontAwesome5 name="circle" size={24} color="#ddd" />
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
            />

            <TouchableOpacity 
                style={[
                    styles.continueButton,
                    items.every(item => item.checked) && styles.continueButtonComplete
                ]} 
                onPress={handleContinuePress}
            >
                <Text style={styles.continueButtonText}>
                    {items.every(item => item.checked) 
                        ? 'Complete! Continue to Payment' 
                        : 'Continue to Payment'}
                </Text>
                <AntDesign name="arrowright" size={20} color="#fff" />
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    headerContainer: {
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginVertical: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    categoriesContainer: {
        marginVertical: 10,
    },
    categoryChip: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginRight: 10,
    },
    categoryText: {
        color: '#fff',
        fontWeight: '600',
    },
    selectedCategory: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    addItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 40,
        marginRight: 10,
    },
    prioritySelector: {
        flexDirection: 'row',
    },
    priorityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedPriority: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    priorityButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#4a90e2',
        borderRadius: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        borderLeftWidth: 5,
    },
    itemContent: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: '#2d3436',
    },
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: '#b2bec3',
    },
    itemChecked: {
        opacity: 0.5,
    },
    timestamp: {
        fontSize: 12,
        color: '#636e72',
        marginTop: 3,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2d3436',
        borderRadius: 8,
        paddingVertical: 15,
        marginTop: 20,
    },
    continueButtonComplete: {
        backgroundColor: '#4caf50',
    },
    continueButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 5,
    },
});

export default CheckList;




// import React, { useState, useEffect } from 'react';
// import {
//     StyleSheet,
//     Text,
//     View,
//     FlatList,
//     TouchableOpacity,
//     TextInput,
//     Alert,
//     Animated,
//     Vibration,
//     Platform,
//     KeyboardAvoidingView,
//     ActivityIndicator
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';

// type Item = {
//     id: string;
//     name: string;
//     checked: boolean;
//     timestamp: Date;
//     priority: 'low' | 'medium' | 'high';
// };

// type Category = {
//     id: string;
//     name: string;
//     color: string;
// };

// const categories: Category[] = [
//     { id: '1', name: 'Packing', color: '#4a90e2' },
//     { id: '2', name: 'Moving', color: '#f4511e' },
//     { id: '3', name: 'Cleaning', color: '#43a047' },
// ];

// const initialItems: Item[] = [
//     { 
//         id: '1', 
//         name: 'Packing Boxes', 
//         checked: false, 
//         timestamp: new Date(),
//         priority: 'high'
//     },
//     { 
//         id: '2', 
//         name: 'Bubble Wrap', 
//         checked: false, 
//         timestamp: new Date(),
//         priority: 'medium'
//     },
// ];

// const CheckList: React.FC = () => {
//     const [items, setItems] = useState<Item[]>(initialItems);
//     const [newItem, setNewItem] = useState('');
//     const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
    
//     const fadeAnim = new Animated.Value(1);
//     const navigation = useNavigation();
//     const router = useRouter();

//     const filterItems = () => {
//         return items.filter(item =>
//             item.name.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//     };

//     const handleToggleItem = (id: string) => {
//         Animated.sequence([
//             Animated.timing(fadeAnim, {
//                 toValue: 0.4,
//                 duration: 200,
//                 useNativeDriver: true,
//             }),
//             Animated.timing(fadeAnim, {
//                 toValue: 1,
//                 duration: 200,
//                 useNativeDriver: true,
//             })
//         ]).start();

//         if (Platform.OS === 'ios' || Platform.OS === 'android') {
//             Vibration.vibrate(50);
//         }

//         const updatedItems = items.map(item =>
//             item.id === id ? { ...item, checked: !item.checked } : item
//         );
//         setItems(updatedItems);
//     };

//     const handleAddItem = async () => {
//         if (newItem.trim() === '') {
//             Alert.alert('Error', 'Please enter an item name.');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // Simulate API call
//             await new Promise(resolve => setTimeout(resolve, 500));

//             const newItemObj: Item = {
//                 id: (items.length + 1).toString(),
//                 name: newItem,
//                 checked: false,
//                 timestamp: new Date(),
//                 priority: selectedPriority,
//             };

//             setItems([newItemObj, ...items]);
//             setNewItem('');
//             Alert.alert('Success', 'Item added successfully!');
//         } catch (error) {
//             Alert.alert('Error', 'Failed to add item. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleContinuePress = () => {
//         const uncheckedItems = items.filter(item => !item.checked);
//         if (uncheckedItems.length > 0) {
//             Alert.alert(
//                 'Uncompleted Items',
//                 'You still have uncompleted items. Are you sure you want to continue?',
//                 [
//                     { text: 'Cancel', style: 'cancel' },
//                     { text: 'Continue', onPress: () => router.push('/(authenticated)/(tabs)/Payment/Payment') }
//                 ]
//             );
//         } else {
//             router.push('/(authenticated)/(tabs)/Payment/Payment');
//         }
//     };

//     const getPriorityColor = (priority: string) => {
//         switch (priority) {
//             case 'high': return '#ff6b6b';
//             case 'medium': return '#ffd93d';
//             case 'low': return '#6bff6b';
//             default: return '#6bff6b';
//         }
//     };

//     const renderHeader = () => (
//         <View style={styles.headerContainer}>
//             <Text style={styles.headerTitle}>Moving Checklist</Text>
//             <Text style={styles.headerSubtitle}>
//                 {items.filter(item => item.checked).length} of {items.length} completed
//             </Text>
//         </View>
//     );

//     return (
//         <KeyboardAvoidingView 
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             style={styles.container}
//         >
//             <StatusBar style="light" />
//             {renderHeader()}
            
//             <View style={styles.searchContainer}>
//                 <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
//                 <TextInput
//                     style={styles.searchInput}
//                     placeholder="Search items..."
//                     value={searchQuery}
//                     onChangeText={setSearchQuery}
//                 />
//             </View>

//             <View style={styles.categoriesContainer}>
//                 <FlatList
//                     horizontal
//                     showsHorizontalScrollIndicator={false}
//                     data={categories}
//                     keyExtractor={(item) => item.id}
//                     renderItem={({ item }) => (
//                         <TouchableOpacity
//                             style={[
//                                 styles.categoryChip,
//                                 { backgroundColor: item.color },
//                                 selectedCategory.id === item.id && styles.selectedCategory
//                             ]}
//                             onPress={() => setSelectedCategory(item)}
//                         >
//                             <Text style={styles.categoryText}>{item.name}</Text>
//                         </TouchableOpacity>
//                     )}
//                 />
//             </View>

//             <View style={styles.addItemContainer}>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Add new item"
//                     value={newItem}
//                     onChangeText={setNewItem}
//                 />
//                 <View style={styles.prioritySelector}>
//                     {(['low', 'medium', 'high'] as const).map((priority) => (
//                         <TouchableOpacity
//                             key={priority}
//                             style={[
//                                 styles.priorityButton,
//                                 { backgroundColor: getPriorityColor(priority) },
//                                 selectedPriority === priority && styles.selectedPriority
//                             ]}
//                             onPress={() => setSelectedPriority(priority)}
//                         >
//                             <Text style={styles.priorityButtonText}>
//                                 {priority.charAt(0).toUpperCase()}
//                             </Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//                 <TouchableOpacity 
//                     style={styles.addButton} 
//                     onPress={handleAddItem}
//                     disabled={isLoading}
//                 >
//                     {isLoading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Ionicons name="add" size={24} color="#fff" />
//                     )}
//                 </TouchableOpacity>
//             </View>

//             <FlatList
//                 data={filterItems()}
//                 keyExtractor={(item) => item.id}
//                 renderItem={({ item }) => (
//                     <Animated.View style={{ opacity: fadeAnim }}>
//                         <TouchableOpacity
//                             style={[
//                                 styles.item,
//                                 item.checked && styles.itemChecked,
//                                 { borderLeftColor: getPriorityColor(item.priority) }
//                             ]}
//                             onPress={() => handleToggleItem(item.id)}
//                         >
//                             <View style={styles.itemContent}>
//                                 <Text style={[
//                                     styles.itemText,
//                                     item.checked && styles.itemTextChecked
//                                 ]}>
//                                     {item.name}
//                                 </Text>
//                                 <Text style={styles.timestamp}>
//                                     {new Date(item.timestamp).toLocaleTimeString([], { 
//                                         hour: '2-digit', 
//                                         minute: '2-digit' 
//                                     })}
//                                 </Text>
//                             </View>
//                             {item.checked ? (
//                                 <MaterialIcons name="check-circle" size={24} color="#4caf50" />
//                             ) : (
//                                 <FontAwesome5 name="circle" size={24} color="#ddd" />
//                             )}
//                         </TouchableOpacity>
//                     </Animated.View>
//                 )}
//             />

//             <TouchableOpacity 
//                 style={[
//                     styles.continueButton,
//                     items.every(item => item.checked) && styles.continueButtonComplete
//                 ]} 
//                 onPress={handleContinuePress}
//             >
//                 <Text style={styles.continueButtonText}>
//                     {items.every(item => item.checked) 
//                         ? 'Complete! Continue to Payment' 
//                         : 'Continue to Payment'}
//                 </Text>
//                 <AntDesign name="arrowright" size={20} color="#fff" />
//             </TouchableOpacity>
//         </KeyboardAvoidingView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8f9fa',
//         padding: 20,
//     },
//     headerContainer: {
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
//     searchContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         borderRadius: 12,
//         paddingHorizontal: 15,
//         marginBottom: 15,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     searchIcon: {
//         marginRight: 10,
//     },
//     searchInput: {
//         flex: 1,
//         paddingVertical: 12,
//         fontSize: 16,
//     },
//     categoriesContainer: {
//         marginBottom: 20,
//     },
//     categoryChip: {
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         marginRight: 10,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     selectedCategory: {
//         transform: [{ scale: 1.05 }],
//     },
//     categoryText: {
//         color: '#fff',
//         fontWeight: '600',
//     },
//     addItemContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     input: {
//         flex: 1,
//         borderRadius: 12,
//         backgroundColor: '#fff',
//         paddingHorizontal: 15,
//         paddingVertical: 12,
//         fontSize: 16,
//         marginRight: 10,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     prioritySelector: {
//         flexDirection: 'row',
//         marginRight: 10,
//     },
//     priorityButton: {
//         width: 30,
//         height: 30,
//         borderRadius: 15,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 5,
//     },
//     selectedPriority: {
//         transform: [{ scale: 1.1 }],
//     },
//     priorityButtonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         fontSize: 12,
//     },
//     addButton: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         backgroundColor: '#4a90e2',
//         justifyContent: 'center',
//         alignItems: 'center',
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//     },
//     item: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         padding: 15,
//         marginBottom: 10,
//         borderRadius: 12,
//         borderLeftWidth: 4,
//         elevation: 2,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//     },
//     itemContent: {
//         flex: 1,
//     },
//     itemChecked: {
//         backgroundColor: '#f8f9fa',
//         borderColor: '#4caf50',
//     },
//     itemText: {
//         fontSize: 16,
//         color: '#2d3436',
//         marginBottom: 4,
//     },
//     itemTextChecked: {
//         color: '#a0a0a0',
//         textDecorationLine: 'line-through',
//     },
//     timestamp: {
//         fontSize: 12,
//         color: '#636e72',
//     },
//     continueButton: {
//         flexDirection: 'row',
//         backgroundColor: '#ff6b6b',
//         padding: 16,
//         borderRadius: 12,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 20,
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.2,
//         shadowRadius: 5,
//     },
//     continueButtonComplete: {
//         backgroundColor: '#4caf50',
//     },
//     continueButtonText: {
//         fontSize: 18,
//         color: '#fff',
//         fontWeight: 'bold',
//         marginRight: 10,
//     },
// });

// export default CheckList;


// // import React, { useState } from 'react';
// // import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';
// // import { StatusBar } from 'expo-status-bar';

// // type Item = {
// //     id: string;
// //     name: string;
// //     checked: boolean;
// // };

// // const initialItems: Item[] = [
// //     { id: '1', name: 'Packing Boxes', checked: false },
// //     { id: '2', name: 'Bubble Wrap', checked: false },
// //     // { id: '3', name: 'Packing Tape', checked: false },
// //     // { id: '4', name: 'Furniture Covers', checked: false },
// // ];

// // const CheckList: React.FC = () => {
// //     const [items, setItems] = useState<Item[]>(initialItems);
// //     const [newItem, setNewItem] = useState('');
// //     const navigation = useNavigation();
// //     const router = useRouter();

// //     const handleToggleItem = (id: string) => {
// //         const updatedItems = items.map(item =>
// //             item.id === id ? { ...item, checked: !item.checked } : item
// //         );
// //         setItems(updatedItems);
// //     };

// //     const handleAddItem = () => {
// //         if (newItem.trim() === '') {
// //             Alert.alert('Error', 'Please enter an item name.');
// //             return;
// //         }
// //         const newItemObj: Item = {
// //             id: (items.length + 1).toString(),
// //             name: newItem,
// //             checked: false,
// //         };
// //         setItems([...items, newItemObj]);
// //         setNewItem('');
// //     }; `2`

// //     const handleContinuePress = () => {
// //         router.push('Payment')
// //     };

// //     return (
// //         <>
// //             <StatusBar style='light' />
// //             <View style={styles.container}>
// //                 <View style={styles.addItemContainer}>
// //                     <TextInput
// //                         style={styles.input}
// //                         placeholder="Add new item"
// //                         value={newItem}
// //                         onChangeText={setNewItem}
// //                     />
// //                     <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
// //                         <Ionicons name="add" size={24} color="#fff" />
// //                     </TouchableOpacity>
// //                 </View>
// //                 <FlatList
// //                     data={items}
// //                     keyExtractor={(item) => item.id}
// //                     renderItem={({ item }) => (
// //                         <TouchableOpacity
// //                             style={[
// //                                 styles.item,
// //                                 item.checked && styles.itemChecked
// //                             ]}
// //                             onPress={() => handleToggleItem(item.id)}
// //                         >
// //                             <Text style={[
// //                                 styles.itemText,
// //                                 item.checked && styles.itemTextChecked
// //                             ]}>
// //                                 {item.name}
// //                             </Text>
// //                             {item.checked && (
// //                                 <MaterialIcons name="check-circle" size={24} color="#4caf50" />
// //                             )}
// //                         </TouchableOpacity>
// //                     )}
// //                 />
// //                 <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
// //                     <Text style={styles.continueButtonText}>Continue to Payment</Text>
// //                 </TouchableOpacity>
// //             </View>
// //         </>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         backgroundColor: '#f0f4f8',
// //         padding: 20,
// //     },
// //     header: {
// //         backgroundColor: '#4a90e2',
// //         paddingVertical: 20,
// //         borderRadius: 10,
// //         marginBottom: 20,
// //         alignItems: 'center',
// //     },
// //     headerText: {
// //         fontSize: 24,
// //         color: '#fff',
// //         fontWeight: 'bold',
// //     },
// //     addItemContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         marginBottom: 20,
// //     },
// //     input: {
// //         flex: 1,
// //         borderRadius: 30,
// //         backgroundColor: '#fff',
// //         paddingHorizontal: 15,
// //         paddingVertical: 10,
// //         fontSize: 16,
// //         marginRight: 10,
// //         borderColor: '#ddd',
// //         borderWidth: 1,
// //     },
// //     addButton: {
// //         width: 50,
// //         height: 50,
// //         borderRadius: 25,
// //         backgroundColor: '#4a90e2',
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //     },
// //     item: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         backgroundColor: '#fff',
// //         padding: 15,
// //         marginBottom: 10,
// //         borderRadius: 10,
// //         borderColor: '#ddd',
// //         borderWidth: 1,
// //     },
// //     itemChecked: {
// //         backgroundColor: '#e0f7fa',
// //         borderColor: '#4caf50',
// //     },
// //     itemText: {
// //         flex: 1,
// //         fontSize: 16,
// //         color: '#333',
// //     },
// //     itemTextChecked: {
// //         color: '#4caf50',
// //         textDecorationLine: 'line-through',
// //     },
// //     continueButton: {
// //         backgroundColor: '#ff6f61',
// //         padding: 15,
// //         borderRadius: 30,
// //         alignItems: 'center',
// //         marginTop: 20,
// //         elevation: 5, // Shadow effect for Android
// //         shadowColor: '#000', // Shadow for iOS
// //         shadowOffset: { width: 0, height: 4 },
// //         shadowOpacity: 0.3,
// //         shadowRadius: 6,
// //     },
// //     continueButtonText: {
// //         fontSize: 18,
// //         color: '#fff',
// //         fontWeight: 'bold',
// //     },
// // });

// // export default CheckList;


// // // import React, { useState } from 'react';
// // // import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Switch } from 'react-native';
// // // import { MaterialIcons, AntDesign } from '@expo/vector-icons';

// // // type CheckListItem = {
// // //     id: string;
// // //     text: string;
// // //     completed: boolean;
// // // };

// // // const CheckList: React.FC = () => {
// // //     const [items, setItems] = useState<CheckListItem[]>([]);
// // //     const [newItem, setNewItem] = useState<string>('');

// // //     const addItem = () => {
// // //         if (newItem.trim().length === 0) return;
// // //         const newCheckListItem: CheckListItem = {
// // //             id: Math.random().toString(),
// // //             text: newItem,
// // //             completed: false,
// // //         };
// // //         setItems([...items, newCheckListItem]);
// // //         setNewItem('');
// // //     };

// // //     const toggleItemCompletion = (id: string) => {
// // //         const updatedItems = items.map(item =>
// // //             item.id === id ? { ...item, completed: !item.completed } : item
// // //         );
// // //         setItems(updatedItems);
// // //     };

// // //     const renderItem = ({ item }: { item: CheckListItem }) => (
// // //         <View style={styles.itemContainer}>
// // //             <TouchableOpacity
// // //                 style={[styles.item, item.completed && styles.itemCompleted]}
// // //                 onPress={() => toggleItemCompletion(item.id)}
// // //             >
// // //                 <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
// // //                     {item.text}
// // //                 </Text>
// // //             </TouchableOpacity>
// // //         </View>
// // //     );

// // //     return (
// // //         <View style={styles.container}>
// // //             <View style={styles.header}>
// // //                 <Text style={styles.headerText}>Your CheckList</Text>
// // //             </View>
// // //             <View style={styles.addItemContainer}>
// // //                 <TextInput
// // //                     style={styles.input}
// // //                     placeholder="Add a new item..."
// // //                     value={newItem}
// // //                     onChangeText={setNewItem}
// // //                 />
// // //                 <TouchableOpacity style={styles.addButton} onPress={addItem}>
// // //                     <AntDesign name="pluscircle" size={24} color="#fff" />
// // //                 </TouchableOpacity>
// // //             </View>
// // //             <FlatList
// // //                 data={items}
// // //                 renderItem={renderItem}
// // //                 keyExtractor={item => item.id}
// // //                 contentContainerStyle={styles.list}
// // //             />
// // //         </View>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         backgroundColor: '#f5f5f5',
// // //         padding: 15,
// // //     },
// // //     header: {
// // //         padding: 15,
// // //         backgroundColor: '#4a90e2',
// // //         borderRadius: 10,
// // //         alignItems: 'center',
// // //         marginBottom: 20,
// // //         shadowColor: '#000',
// // //         shadowOffset: { width: 0, height: 2 },
// // //         shadowOpacity: 0.3,
// // //         shadowRadius: 5,
// // //     },
// // //     headerText: {
// // //         fontSize: 24,
// // //         color: '#fff',
// // //         fontWeight: 'bold',
// // //     },
// // //     addItemContainer: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         marginBottom: 20,
// // //     },
// // //     input: {
// // //         flex: 1,
// // //         padding: 10,
// // //         borderRadius: 25,
// // //         backgroundColor: '#fff',
// // //         borderColor: '#ddd',
// // //         borderWidth: 1,
// // //         marginRight: 10,
// // //     },
// // //     addButton: {
// // //         backgroundColor: '#4a90e2',
// // //         padding: 10,
// // //         borderRadius: 25,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //     },
// // //     list: {
// // //         flexGrow: 1,
// // //     },
// // //     itemContainer: {
// // //         marginBottom: 10,
// // //     },
// // //     item: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         backgroundColor: '#fff',
// // //         borderRadius: 10,
// // //         padding: 15,
// // //         shadowColor: '#000',
// // //         shadowOffset: { width: 0, height: 2 },
// // //         shadowOpacity: 0.1,
// // //         shadowRadius: 5,
// // //     },
// // //     itemCompleted: {
// // //         backgroundColor: '#d4edda',
// // //         borderColor: '#c3e6cb',
// // //         borderWidth: 1,
// // //     },
// // //     itemText: {
// // //         fontSize: 16,
// // //         color: '#333',
// // //     },
// // //     itemTextCompleted: {
// // //         textDecorationLine: 'line-through',
// // //         color: '#6c757d',
// // //     },
// // // });

// // // export default CheckList;
