import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { RootStackParamList } from '../../App';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { language, user } = useApp();
  const t = translations[language];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{user.avatar}</Text>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userTagline}>{user.name} is working towards their goals!</Text>

          <View style={styles.progressRing}>
            <View style={styles.progressRingInner}>
              <Text style={styles.progressPercent}>{user.progress}%</Text>
              <Text style={styles.progressLabel}>{t.toGoal}</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{t.addNewGoal}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>{t.achievements}</Text>
          <View style={styles.achievementGrid}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementBadge, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.achievementEmoji}>🔥</Text>
              </View>
              <Text style={styles.achievementText}>{user.streak} {t.streak}</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementBadge, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.achievementEmoji}>✅</Text>
              </View>
              <Text style={styles.achievementText}>Week 1</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementBadge, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.achievementEmoji}>🎯</Text>
              </View>
              <Text style={styles.achievementText}>First Goal</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t.backToDashboard}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#00A86B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userTagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
  },
  progressRingInner: {
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#00A86B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

export default ProfileScreen;