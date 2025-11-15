# React Native: Discord-style App Shell

This file contains a complete, copy-pasteable TypeScript React Native setup for a Discord-like app shell:
- Left side drawer (side menu) that **closes after selecting** an item
- Drawer + Stack navigation using **React Navigation v6**
- Light / Dark theme support with a ThemeProvider that persists user's choice using AsyncStorage
- Gesture handler and Reanimated notes

> Paste each code block into the corresponding file in your project.

---

## 0. Install (run in your project root)

```bash
# React Navigation core
yarn add @react-navigation/native

# React Navigation stacks and drawer
yarn add @react-navigation/native-stack @react-navigation/drawer

# Peer dependencies
yarn add react-native-gesture-handler react-native-reanimated react-native-safe-area-context @react-native-community/masked-view

# Async storage for persisting theme
yarn add @react-native-async-storage/async-storage

# If you use TypeScript (recommended) ensure types are present
yarn add -D @types/react @types/react-native

# iOS pods
npx pod-install
```

**Extra steps:**
- Wrap app entry with `GestureHandlerRootView` (react-native-gesture-handler).
- Reanimated: add plugin to `babel.config.js` and rebuild the app (native). See reanimated docs for exact steps.

Add to `babel.config.js` (if using Reanimated):

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

---

## 1. App entry: `App.tsx`

```tsx
// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

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
```

---

## 2. Theme provider and persisted theme: `src/theme/ThemeProvider.tsx`

```tsx
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DarkTheme as NavigationDark, DefaultTheme as NavigationLight, Theme as NavTheme } from '@react-navigation/native';
import { ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'app.theme';

type ThemeName = 'light' | 'dark';

type ThemeContextType = {
  themeName: ThemeName;
  toggleTheme: () => Promise<void>;
  setTheme: (t: ThemeName) => Promise<void>;
  theme: {
    colors: {
      background: string;
      card: string;
      text: string;
      primary: string;
      muted: string;
    };
    statusBarStyle: 'dark-content' | 'light-content';
    navigationTheme: NavTheme;
  };
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LightColors = {
  background: '#f7f8fb',
  card: '#ffffff',
  text: '#111827',
  primary: '#0f62fe',
  muted: '#6b7280',
};

const DarkColors = {
  background: '#0f1724',
  card: '#0b1220',
  text: '#e6eef8',
  primary: '#4f8cff',
  muted: '#9ca3af',
};

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (raw === 'dark' || raw === 'light') setThemeName(raw);
      } catch (e) {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setTheme = async (t: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, t);
    } catch (e) {
      console.warn('Failed saving theme', e);
    }
    setThemeName(t);
  };

  const toggleTheme = async () => {
    await setTheme(themeName === 'dark' ? 'light' : 'dark');
  };

  const theme = useMemo(() => {
    const isDark = themeName === 'dark';
    const colors = isDark ? DarkColors : LightColors;

    const navigationTheme = isDark
      ? {
          ...NavigationDark,
          colors: {
            ...NavigationDark.colors,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            primary: colors.primary,
          },
        }
      : {
          ...NavigationLight,
          colors: {
            ...NavigationLight.colors,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            primary: colors.primary,
          },
        };

    return {
      colors,
      statusBarStyle: isDark ? 'light-content' : 'dark-content',
      navigationTheme,
    };
  }, [themeName]);

  if (!loaded) return null; // or splash while theme loads

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, setTheme, theme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
```

---

## 3. Root navigator with Drawer: `src/navigation/RootNavigator.tsx`

```tsx
// src/navigation/RootNavigator.tsx
import React from 'react';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { DrawerContent } from './components/DrawerContent';

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
    <Stack.Screen name="Settings" component={SettingsScreen} />
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
```

---

## 4. Custom Drawer content: `src/navigation/components/DrawerContent.tsx`

```tsx
// src/navigation/components/DrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from '../../theme/ThemeProvider';

const MenuItem: React.FC<{
  label: string;
  onPress: () => void;
}> = ({ label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuItem}>
    <Text style={styles.menuText}>{label}</Text>
  </TouchableOpacity>
);

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const { themeName, toggleTheme, theme } = useTheme();

  const navigateAndClose = (screenName: string) => {
    // Navigate to screen then close the drawer
    navigation.navigate(screenName as never);
    // close drawer after a short delay to allow navigate to start (optional)
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView contentContainerStyle={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>MyApp</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Welcome back</Text>
      </View>

      <View style={styles.menuGroup}>
        <MenuItem label="Home" onPress={() => navigateAndClose('Home')} />
        <MenuItem label="Messages" onPress={() => navigateAndClose('Messages')} />
        <MenuItem label="Profile" onPress={() => navigateAndClose('Profile')} />
        <MenuItem label="Settings" onPress={() => navigateAndClose('Settings')} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.themeBtn} onPress={() => toggleTheme()}>
          <Text style={{ color: theme.colors.text }}>{themeName === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingVertical: 20,
  },
  header: { paddingHorizontal: 20, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { marginTop: 4, fontSize: 13 },
  menuGroup: { marginTop: 10 },
  menuItem: { paddingVertical: 14, paddingHorizontal: 20 },
  menuText: { fontSize: 16, fontWeight: '600' },
  footer: { marginTop: 30, paddingHorizontal: 20 },
  themeBtn: { paddingVertical: 10 },
});
```

---

## 5. Example screens (Home / Messages / Profile / Settings)

Create `src/screens/HomeScreen.tsx` (and copy-paste for other screens, changing text):

```tsx
// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity style={styles.openBtn} onPress={() => navigation.toggleDrawer()}>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Open Menu</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.colors.text }]}>Home</Text>
      <Text style={{ color: theme.colors.muted }}>This is the main feed.</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  openBtn: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
});
```

Duplicate `MessagesScreen.tsx`, `ProfileScreen.tsx`, `SettingsScreen.tsx` with appropriate labels. In `SettingsScreen` you can import `useTheme` and show a theme toggle too.

---

## 6. Notes / UX details

- **Drawer closes after selection:** `navigation.navigate('Screen')` + `navigation.closeDrawer()` ensures drawer is closed. We call both in `navigateAndClose`.
- **Animations & gestures** are handled by react-native-gesture-handler and reanimated — reinstall and rebuild after adding reanimated plugin.
- **Persisted Theme:** ThemeProvider saves user's last choice in AsyncStorage and applies it on app start.
- **Header & stacking:** We used a Stack inside the Drawer to allow pushing other screens while keeping drawer available.

---

## 7. Optional improvements (next steps)

- Add icons to drawer items (react-native-vector-icons).
- Add unread badges and dynamic counts in drawer entries.
- Add user avatar in drawer header + profile quick actions.
- Add deep linking and custom splash while theme loads.

---

If you want, I can:
- Convert this to **Expo** (quick migration), or
- Provide a ready-to-paste git repo structure, or
- Wire this into your existing AuthProvider so the drawer shows user info.

Tell me which of these you'd like next.
