import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from '../theme/ThemeProvider';
import { useNotifications } from '../contexts/NotificationsContext';
import Icon from '@react-native-vector-icons/feather';

type IconName = React.ComponentProps<typeof Icon>['name'];

const MenuItem: React.FC<{
  label: string;
  icon: IconName;
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