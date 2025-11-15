import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { View, Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
// import MessagesScreen from '../screens/MessagesScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen';
import { DrawerContent } from '../components/DrawerContent';

// const HomeScreen = () => {
//     return <View>
//         <Text>Home Screen</Text>
//     </View>
// };

const MessagesScreen = () => {
    return <View>
        <Text>ProfileScreen</Text>
    </View>
};

const ProfileScreen = () => {
    return <View>
        <Text>ProfileScreen</Text>
    </View>
};



export type RootStackParamList = {
    Home: undefined;
    Messages: undefined;
    Profile: undefined;
    Settings: undefined;
};


const Drawer = createDrawerNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator();


const MainStack: React.FC = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        {/* <Stack.Screen name="Settings" component={SettingsScreen} /> */}
    </Stack.Navigator>
);


export const RootNavigator: React.FC = () => {
    return (
        <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
            drawerContent={(props: DrawerContentComponentProps) => <DrawerContent {...props} />}
        >
            <Drawer.Screen name="Home" component={MainStack} />
            <Drawer.Screen name="Messages" component={MainStack} />
            <Drawer.Screen name="Profile" component={MainStack} />
            <Drawer.Screen name="Settings" component={MainStack} />
        </Drawer.Navigator>
    );
};


export default RootNavigator;