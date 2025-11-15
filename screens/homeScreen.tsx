// import {useNavigation} from '@react-navigation/native';
import { StatusBar, StyleSheet, useColorScheme, View, Button, Text } from 'react-native';

export function HomeScreen() {
//   const navigation = useNavigation();

  return (
    <Button
      title="Go to Jane's profile"
      onPress={() => {
        // navigation.navigate('Profile', {name: 'Jane'})
      }
    
      }
    />
  );
}

export function ProfileScreen() {
  return <Text>This is 's profile</Text>;
}