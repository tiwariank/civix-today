# Discord-style Enhancements: Icons, Badges, Avatar, Deep Linking, JS Splash

This document adds the requested features to your existing React Native Discord-style app shell:

- Add icons to drawer items (react-native-vector-icons)
- Add unread badges and dynamic counts in drawer entries (NotificationsContext)
- Add user avatar in drawer header + profile quick actions
- Add deep linking configuration for React Navigation
- Add a lightweight *custom JS splash screen* while the theme loads

Paste these files into your project and follow the install steps below.

---

## 0) Install (run in project root)

```bash
# vector icons
yarn add react-native-vector-icons

# if not already present (navigation + async storage etc.)
# yarn add @react-navigation/native @react-navigation/drawer @react-navigation/native-stack react-native-gesture-handler react-native-reanimated react-native-safe-area-context @react-native-async-storage/async-storage

# iOS pods
npx pod-install
```

**Android extra step (fonts)**: `react-native-vector-icons` is autolinked, but make sure your `android/app/build.gradle` includes:

```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

This will copy fonts to your Android assets.

---

## 1) Notifications Context (dynamic counts)

Create `src/contexts/NotificationsContext.tsx` — a small context to hold unread counts, and helpers to modify counts.

```tsx
// src/contexts/NotificationsContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';

type Counts = { messages: number; mentions: number; notifications: number };

type NotificationsContextType = {
  counts: Counts;
  setCounts: (c: Partial<Counts>) => void;
  increment: (key: keyof Counts, by?: number) => void;
  reset: (key: keyof Counts) => void;
};

const defaultCounts: Counts = { messages: 0, mentions: 0, notifications: 0 };
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [counts, setCountsRaw] = useState<Counts>(defaultCounts);

  const setCounts = (c: Partial<Counts>) => setCountsRaw((prev) => ({ ...prev, ...c }));
  const increment = (key: keyof Counts, by = 1) => setCountsRaw((prev) => ({ ...prev, [key]: prev[key] + by }));
  const reset = (key: keyof Counts) => setCountsRaw((prev) => ({ ...prev, [key]: 0 }));

  const value = useMemo(() => ({ counts, setCounts, increment, reset }), [counts]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
```

Wrap your app with `NotificationsProvider` in `App.tsx` (see section 5).

---

## 2) Updated Drawer Content (icons, badges, avatar, quick actions)

Replace your `src/navigation/components/DrawerContent.tsx` with the following. It uses `react-native-vector-icons/Feather` for icons and `useNotifications` for counts.

```tsx
// src/navigation/components/DrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from '../../theme/ThemeProvider';
import Icon from 'react-native-vector-icons/Feather';
import { useNotifications } from '../../contexts/NotificationsContext';

const MenuItem: React.FC<{
  label: string;
  icon: string;
  badge?: number;
  onPress: () => void;
}> = ({ label, icon, badge, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={18} color="#4b5563" />
        <Text style={styles.menuText}>{label}</Text>
      </View>

      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const { counts } = useNotifications();
  const { themeName, toggleTheme, theme } = useTheme();

  // Mock user — replace with your AuthContext user
  const user = {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    avatar: 'https://i.pravatar.cc/120',
  };

  const navigateAndClose = (screenName: string) => {
    navigation.navigate(screenName as never);
    navigation.closeDrawer();
  };

  const onProfilePress = () => {
    // Quick action: go to profile
    navigation.navigate('Profile' as never);
    navigation.closeDrawer();
  };

  const onLogout = () => {
    Alert.alert('Logout', 'Log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('logout') },
    ]);
  };

  return (
    <DrawerContentScrollView contentContainerStyle={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarRow} onPress={onProfilePress}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{user.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>{user.email}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => Alert.alert('Edit Profile')} style={styles.iconBtn}>
            <Icon name="edit-3" size={16} color={theme.colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} style={styles.iconBtn}>
            <Icon name="log-out" size={16} color={theme.colors.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuGroup}>
        <MenuItem label="Home" icon="home" onPress={() => navigateAndClose('Home')} />
        <MenuItem label="Messages" icon="message-circle" badge={counts.messages} onPress={() => navigateAndClose('Messages')} />
        <MenuItem label="Mentions" icon="at-sign" badge={counts.mentions} onPress={() => navigateAndClose('Messages')} />
        <MenuItem label="Notifications" icon="bell" badge={counts.notifications} onPress={() => navigateAndClose('Settings')} />
        <MenuItem label="Profile" icon="user" onPress={() => navigateAndClose('Profile')} />
        <MenuItem label="Settings" icon="settings" onPress={() => navigateAndClose('Settings')} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.themeBtn} onPress={() => toggleTheme()}>
          <Icon name={themeName === 'dark' ? 'sun' : 'moon'} size={16} color={theme.colors.text} />
          <Text style={[styles.themeText, { color: theme.colors.text }]}>
            {themeName === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#ccc' },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  iconBtn: { padding: 8, marginLeft: 6 },

  menuGroup: { marginTop: 12 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { marginLeft: 12, fontSize: 15, color: '#111' },

  badge: { backgroundColor: '#ff4d4f', minWidth: 26, paddingHorizontal: 6, height: 22, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  footer: { marginTop: 20, paddingHorizontal: 16 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  themeText: { marginLeft: 8, fontWeight: '700' },
});
```

**Notes:**
- Replace `user` with your `AuthContext`'s user object (avatar, name, email).
- `counts` come from `NotificationsContext`. Update counts from app events (messages, web socket, push notifications, etc.).

---

## 3) JS Splash while theme loads

We will expose `loaded` from the ThemeProvider and show a lightweight `Splash` component until theme finishes restoring from AsyncStorage.

### 3a) Update `src/theme/ThemeProvider.tsx`

Modify it to return `loaded` via context and not render `null`. Replace the previous file with this updated version (only the relevant parts shown here). Make sure you keep the rest of the ThemeProvider implementation from earlier.

```tsx
// src/theme/ThemeProvider.tsx (updated snippet)
// ...imports remain the same

type ThemeContextType = {
  themeName: ThemeName;
  toggleTheme: () => Promise<void>;
  setTheme: (t: ThemeName) => Promise<void>;
  theme: { colors: any; statusBarStyle: 'dark-content' | 'light-content'; navigationTheme: any };
  loaded: boolean; // new
};

// inside the provider component, after loading state
  // previously: if (!loaded) return null;
  // instead we set loaded in context and let App choose how to show splash

  return (
    <ThemeContext.Provider value={{ themeName, toggleTheme, setTheme, theme, loaded }}>
      {children}
    </ThemeContext.Provider>
  );
```

### 3b) Create `src/components/SplashScreen.tsx`

```tsx
// src/components/SplashScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

export const SplashScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.root}>
      <Image source={require('../../assets/splash-logo.png')} style={styles.logo} />
      <ActivityIndicator style={{ marginTop: 16 }} size="small" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f1724' },
  logo: { width: 120, height: 120, borderRadius: 18 },
  text: { color: '#fff', marginTop: 12 },
});
```

> Add a simple `assets/splash-logo.png` image. If you don't want an image, remove the `<Image/>` line.

### 3c) Update `App.tsx` to show the splash while theme loads

```tsx
// App.tsx (updated)
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { SplashScreen } from './src/components/SplashScreen';
import { NotificationsProvider } from './src/contexts/NotificationsContext';

const Inner: React.FC = () => {
  const { theme, loaded } = useTheme();

  if (!loaded) return <SplashScreen message="Applying theme..." />;

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
        <NotificationsProvider>
          <Inner />
        </NotificationsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
```

---

## 4) Deep linking setup (React Navigation)

Add a `linking` config to `NavigationContainer` so your app responds to URLs like `myapp://messages/123`.

Create `src/navigation/linking.ts`:

```ts
// src/navigation/linking.ts
export const linking = {
  prefixes: ['myapp://', 'https://myapp.example.com'],
  config: {
    screens: {
      Home: 'home',
      Messages: {
        path: 'messages',
        screens: {
          // if you have nested screens, map them here
          MessagesList: '',
          MessageDetail: 'detail/:id',
        },
      },
      Profile: 'profile/:userId?',
      Settings: 'settings',
    },
  },
};
```

Then import and use it in `App.tsx` (Inner component):

```tsx
import { linking } from './src/navigation/linking';

// then
<NavigationContainer theme={theme.navigationTheme} linking={linking}>
  ...
</NavigationContainer>
```

**Android intent filters**: add to `android/app/src/main/AndroidManifest.xml` within `<activity>` to handle `myapp://` and `https` (example: replace `com.yourapp`):

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" android:host="" />
  <data android:scheme="https" android:host="myapp.example.com" />
</intent-filter>
```

**iOS URL Types / Universal Links**: configure in Xcode (URL Types) for `myapp` scheme or set up Universal Links for `https` prefixes.

---

## 5) Putting it all together (summary / checks)

1. Add new files: `NotificationsContext`, updated `DrawerContent`, `SplashScreen`, `linking.ts`.
2. Install `react-native-vector-icons` and run `npx pod-install`.
3. Ensure `android/app/build.gradle` includes `apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"`.
4. Wrap app with `NotificationsProvider` and `ThemeProvider` (see App.tsx snippet above).
5. Replace DrawerContent import in `RootNavigator` to use the new DrawerContent (path: `./components/DrawerContent`).
6. Replace the mocked user in DrawerContent with your real `AuthContext` user when integrated.
7. Use `useNotifications().increment('messages')` from anywhere in the app (e.g., when receiving websocket messages) to update the badge counts.

---

## 6) Small example: increment unread when pushing to Messages

In `MessagesScreen` you might call:

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useNotifications } from '../contexts/NotificationsContext';

const MessagesScreen = () => {
  const { increment, reset } = useNotifications();

  return (
    <View>
      <Button title="Simulate incoming message" onPress={() => increment('messages')} />
      <Button title="Mark all read" onPress={() => reset('messages')} />
    </View>
  );
};

export default MessagesScreen;
```

---

If you want, I can now:
- update your canvas `ReactNative-DiscordStyle-Navigation-Theme-Setup` with these files, or
- produce a ready-to-clone Git repo tree, or
- wire the Drawer header avatar to your existing `AuthProvider` and show logout functionality.

Which would you like next?
