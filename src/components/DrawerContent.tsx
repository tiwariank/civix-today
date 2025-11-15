import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from '../theme/ThemeProvider';


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