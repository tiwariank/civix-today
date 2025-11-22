import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { RootStackParamList } from '../../App';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

interface GoalData {
  title: string;
  targetDate: string | null;
  size: 'small' | 'medium' | 'big';
}

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { language, setLanguage, addGoal } = useApp();
  const [step, setStep] = useState<number>(0);
  const [goalData, setGoalData] = useState<GoalData>({
    title: '',
    targetDate: null,
    size: 'medium'
  });
  const t = translations[language];

  const renderStep = (): JSX.Element => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>{t.welcome}</Text>
            <Text style={styles.subtitle}>{t.whatGoal}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Save ₹10,000"
              value={goalData.title}
              onChangeText={(text) => setGoalData({ ...goalData, title: text })}
              placeholderTextColor="#999"
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>📅</Text>
            <Text style={styles.title}>{t.byWhen}</Text>
            <View style={styles.buttonGroup}>
              {[30, 60, 90].map(days => (
                <TouchableOpacity
                  key={days}
                  style={styles.optionButton}
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + days);
                    setGoalData({ ...goalData, targetDate: date.toISOString() });
                    setStep(2);
                  }}
                >
                  <Text style={styles.optionText}>{days} Days</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>{t.breakSteps}</Text>
            <Text style={styles.subtitle}>We'll help you achieve it step by step</Text>
          </View>
        );
      default:
        return <></>;
    }
  };

  const handleNext = (): void => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      if (goalData.title && goalData.targetDate) {
        addGoal(goalData);
      }
      navigation.replace('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.languageToggle}
        onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      >
        <Text style={styles.languageText}>{language === 'en' ? 'हिं' : 'EN'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>{renderStep()}</View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {step === 2 ? t.start : step === 1 ? t.skip : t.next}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Dashboard')}>
          <Text style={styles.skipText}>{t.skip}</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.activeDot]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F6',
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#00A86B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  skipText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  activeDot: {
    backgroundColor: '#00A86B',
  },
});

export default OnboardingScreen;