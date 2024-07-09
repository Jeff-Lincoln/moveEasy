import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomDrawerContent(props: any) {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}
                scrollEnabled={true}
                contentContainerStyle={{ backgroundColor: "#dde3fe" }}>

                <View style={{
                    padding: 20
                }}>
                    <Image source={{
                        uri: 'https://shorturl.at/7i2nR'
                    }}
                        style={{
                            width: 100,
                            height: 100,
                            // borderRadius: 50,
                            // resizeMode: 'cover',
                            // marginBottom: 20,
                            alignSelf: 'center'
                        }} />
                </View>
                <DrawerItemList {...props} />
                <DrawerItem label={"Log Out"} onPress={() => router.replace('/')} />
            </DrawerContentScrollView>

            <View
                style={{
                    borderTopColor: '#dde3fe',
                    borderTopWidth: 1,
                    padding: 20,
                    paddingBottom: 20 + bottom,
                }}>
                <Text>footer</Text>
            </View>
        </View>
    );
}