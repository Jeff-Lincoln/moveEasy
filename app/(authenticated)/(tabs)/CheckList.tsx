import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

type Item = {
    id: string;
    name: string;
    checked: boolean;
};

const initialItems: Item[] = [
    { id: '1', name: 'Packing Boxes', checked: false },
    { id: '2', name: 'Bubble Wrap', checked: false },
    // { id: '3', name: 'Packing Tape', checked: false },
    // { id: '4', name: 'Furniture Covers', checked: false },
];

const CheckList: React.FC = () => {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [newItem, setNewItem] = useState('');
    const navigation = useNavigation();
    const router = useRouter();

    const handleToggleItem = (id: string) => {
        const updatedItems = items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        setItems(updatedItems);
    };

    const handleAddItem = () => {
        if (newItem.trim() === '') {
            Alert.alert('Error', 'Please enter an item name.');
            return;
        }
        const newItemObj: Item = {
            id: (items.length + 1).toString(),
            name: newItem,
            checked: false,
        };
        setItems([...items, newItemObj]);
        setNewItem('');
    }; `2`

    const handleContinuePress = () => {
        router.push('Payment')
    };

    return (
        <>
            <StatusBar style='light' />
            <View style={styles.container}>
                <View style={styles.addItemContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Add new item"
                        value={newItem}
                        onChangeText={setNewItem}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.item,
                                item.checked && styles.itemChecked
                            ]}
                            onPress={() => handleToggleItem(item.id)}
                        >
                            <Text style={[
                                styles.itemText,
                                item.checked && styles.itemTextChecked
                            ]}>
                                {item.name}
                            </Text>
                            {item.checked && (
                                <MaterialIcons name="check-circle" size={24} color="#4caf50" />
                            )}
                        </TouchableOpacity>
                    )}
                />
                <TouchableOpacity style={styles.continueButton} onPress={handleContinuePress}>
                    <Text style={styles.continueButtonText}>Continue to Payment</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 20,
    },
    header: {
        backgroundColor: '#4a90e2',
        paddingVertical: 20,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    addItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    input: {
        flex: 1,
        borderRadius: 30,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    addButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    itemChecked: {
        backgroundColor: '#e0f7fa',
        borderColor: '#4caf50',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    itemTextChecked: {
        color: '#4caf50',
        textDecorationLine: 'line-through',
    },
    continueButton: {
        backgroundColor: '#ff6f61',
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        elevation: 5, // Shadow effect for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    continueButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CheckList;


// import React, { useState } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Switch } from 'react-native';
// import { MaterialIcons, AntDesign } from '@expo/vector-icons';

// type CheckListItem = {
//     id: string;
//     text: string;
//     completed: boolean;
// };

// const CheckList: React.FC = () => {
//     const [items, setItems] = useState<CheckListItem[]>([]);
//     const [newItem, setNewItem] = useState<string>('');

//     const addItem = () => {
//         if (newItem.trim().length === 0) return;
//         const newCheckListItem: CheckListItem = {
//             id: Math.random().toString(),
//             text: newItem,
//             completed: false,
//         };
//         setItems([...items, newCheckListItem]);
//         setNewItem('');
//     };

//     const toggleItemCompletion = (id: string) => {
//         const updatedItems = items.map(item =>
//             item.id === id ? { ...item, completed: !item.completed } : item
//         );
//         setItems(updatedItems);
//     };

//     const renderItem = ({ item }: { item: CheckListItem }) => (
//         <View style={styles.itemContainer}>
//             <TouchableOpacity
//                 style={[styles.item, item.completed && styles.itemCompleted]}
//                 onPress={() => toggleItemCompletion(item.id)}
//             >
//                 <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
//                     {item.text}
//                 </Text>
//             </TouchableOpacity>
//         </View>
//     );

//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={styles.headerText}>Your CheckList</Text>
//             </View>
//             <View style={styles.addItemContainer}>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Add a new item..."
//                     value={newItem}
//                     onChangeText={setNewItem}
//                 />
//                 <TouchableOpacity style={styles.addButton} onPress={addItem}>
//                     <AntDesign name="pluscircle" size={24} color="#fff" />
//                 </TouchableOpacity>
//             </View>
//             <FlatList
//                 data={items}
//                 renderItem={renderItem}
//                 keyExtractor={item => item.id}
//                 contentContainerStyle={styles.list}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//         padding: 15,
//     },
//     header: {
//         padding: 15,
//         backgroundColor: '#4a90e2',
//         borderRadius: 10,
//         alignItems: 'center',
//         marginBottom: 20,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.3,
//         shadowRadius: 5,
//     },
//     headerText: {
//         fontSize: 24,
//         color: '#fff',
//         fontWeight: 'bold',
//     },
//     addItemContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     input: {
//         flex: 1,
//         padding: 10,
//         borderRadius: 25,
//         backgroundColor: '#fff',
//         borderColor: '#ddd',
//         borderWidth: 1,
//         marginRight: 10,
//     },
//     addButton: {
//         backgroundColor: '#4a90e2',
//         padding: 10,
//         borderRadius: 25,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     list: {
//         flexGrow: 1,
//     },
//     itemContainer: {
//         marginBottom: 10,
//     },
//     item: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         padding: 15,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 5,
//     },
//     itemCompleted: {
//         backgroundColor: '#d4edda',
//         borderColor: '#c3e6cb',
//         borderWidth: 1,
//     },
//     itemText: {
//         fontSize: 16,
//         color: '#333',
//     },
//     itemTextCompleted: {
//         textDecorationLine: 'line-through',
//         color: '#6c757d',
//     },
// });

// export default CheckList;
