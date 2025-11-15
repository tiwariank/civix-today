import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { AppHeader } from '../components/AppHeader';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <AppHeader title="Home" /> 
      {/* <TouchableOpacity style={styles.openBtn} onPress={() => navigation.toggleDrawer()}>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Open Menu</Text>
      </TouchableOpacity> */}

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