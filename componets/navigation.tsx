import * as React from 'react';
import {createStaticNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { HomeScreen, ProfileScreen } from '../screens/homeScreen';


// function HomeScreen() {
//     return <View>
//         <Text>Home Screen</Text>
//     </View>
// }

// function ProfileScreen() {
//     return <View>
//         <Text>Profile Screen</Text>
//     </View>
// }

const RootStack = createNativeStackNavigator({
  screens: {
    Home: {
      screen: HomeScreen,
      options: {title: 'Welcome'},
    },
    Profile: {
      screen: ProfileScreen,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);


export default Navigation;