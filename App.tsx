/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import Navigation from './componets/navigation';
// import { UserScreen } from './screens/userScreen';
// import { ImagePickerComponent } from './componets/ImagePickerComponent';


// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return <ImagePickerComponent />;

//   // return (
//   //   <SafeAreaProvider>
//   //     <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//   //     <AppContent />
//   //   </SafeAreaProvider>
//   // );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;


// import React from 'react';
// import { StatusBar } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { RootNavigator } from './src/navigation/RootNavigator';
// import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
// import { NotificationsProvider } from './src/contexts/NotificationsContext';
// import { Text, View } from 'react-native';
// import ProfileEditScreen from './src/components/ProfileEditScreen';


// const Inner: React.FC = () => {
//   const { theme } = useTheme();
//   return (
//     <NavigationContainer theme={theme.navigationTheme}>
//       <StatusBar barStyle={theme.statusBarStyle} />
//       <RootNavigator />
//     </NavigationContainer>
//   );
// };

// const App: React.FC = () => (
//   <GestureHandlerRootView style={{ flex: 1 }}>
//     <SafeAreaProvider>
//        <NotificationsProvider>
//         <ThemeProvider>
//         <Inner />
//       </ThemeProvider>
//        </NotificationsProvider>
//         {/* <ProfileEditScreen /> */}
//     </SafeAreaProvider>
//   </GestureHandlerRootView>
// );

// export default App;


import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider } from './src1/context/AppContext';
import OnboardingScreen from './src1/screens/OnboardingScreen';
import DashboardScreen from './src1/screens/DashboardScreen';
import ProfileScreen from './src1/screens/ProfileScreen';
import GoalScreen from './src1/screens/GoalScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Goal: { goalId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch === null) {
    return <></>;
  }

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={isFirstLaunch ? 'Onboarding' : 'Dashboard'}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Goal" component={GoalScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}