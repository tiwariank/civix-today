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


import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { Text, View } from 'react-native';


const Inner: React.FC = () => {
  const { theme } = useTheme();
  return (
    <NavigationContainer theme={theme.navigationTheme}>
      <StatusBar barStyle={theme.statusBarStyle} />
      <RootNavigator />
    </NavigationContainer>
  );
};

const App: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <Inner />
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;